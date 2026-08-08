import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import {
  conversationKey,
  listFollowingIds,
  listMessages,
  listProfilesByIds,
  sendMessage,
} from '../api/entities'
import { useProfile } from '../hooks/useProfile'
import { sportEmoji } from '../data/sports'
import type { Message } from '../types'

export function Messages() {
  const { profile, userId } = useProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const withId = searchParams.get('with')

  const followingQuery = useQuery({
    queryKey: ['following', userId],
    queryFn: () => listFollowingIds(userId as string),
    enabled: Boolean(userId),
  })
  const friendsQuery = useQuery({
    queryKey: ['friends', followingQuery.data],
    queryFn: () => listProfilesByIds(followingQuery.data ?? []),
    enabled: Boolean(followingQuery.data),
  })

  if (!profile || !userId) return null

  if (withId) {
    return (
      <Conversation
        myId={userId}
        myPseudo={profile.pseudo}
        withId={withId}
        onBack={() => {
          searchParams.delete('with')
          setSearchParams(searchParams, { replace: true })
        }}
      />
    )
  }

  const friends = friendsQuery.data ?? []

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-bold text-white">Messages</h1>
      {friends.length === 0 && (
        <p className="text-sm text-white/40">
          Suis des sportifs depuis l'accueil pour pouvoir leur écrire ici.
        </p>
      )}
      <div className="space-y-2">
        {friends.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setSearchParams({ with: f.id })}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left hover:bg-white/10"
          >
            <img src={f.photo_url ?? undefined} alt={f.pseudo} className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{f.pseudo}</p>
              <p className="truncate text-xs text-white/40">{f.sports.map((s) => sportEmoji(s)).join(' ')}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Conversation({
  myId,
  myPseudo,
  withId,
  onBack,
}: {
  myId: string
  myPseudo: string
  withId: string
  onBack: () => void
}) {
  const queryClient = useQueryClient()
  const key = conversationKey(myId, withId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState('')

  const friendQuery = useQuery({
    queryKey: ['profile-lite', withId],
    queryFn: async () => (await listProfilesByIds([withId]))[0] ?? null,
  })

  const messagesQuery = useQuery({
    queryKey: ['messages', key],
    queryFn: () => listMessages(key),
  })

  const sendMutation = useMutation({
    mutationFn: (value: string) =>
      sendMessage({ conversation_key: key, from_id: myId, to_id: withId, from_pseudo: myPseudo, text: value }),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(['messages', key], (prev) => [...(prev ?? []), message])
      setText('')
    },
  })

  useEffect(() => {
    if (!supabase) return
    const channel = supabase
      .channel(`messages-${key}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_key=eq.${key}` },
        (payload) => {
          const message = payload.new as Message
          queryClient.setQueryData<Message[]>(['messages', key], (prev) => {
            if (prev?.some((m) => m.id === message.id)) return prev
            return [...(prev ?? []), message]
          })
        },
      )
      .subscribe()
    return () => {
      supabase!.removeChannel(channel)
    }
  }, [key, queryClient])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesQuery.data])

  function handleSend() {
    const value = text.trim()
    if (!value) return
    sendMutation.mutate(value)
  }

  const messages = messagesQuery.data ?? []

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-[#070b16]">
      <div className="flex w-full max-w-lg flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-3">
        <button type="button" onClick={onBack} className="text-white/70 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <img
          src={friendQuery.data?.photo_url ?? undefined}
          alt={friendQuery.data?.pseudo}
          className="h-9 w-9 rounded-full object-cover"
        />
        <p className="font-semibold text-white">{friendQuery.data?.pseudo ?? '...'}</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from_id === myId ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                m.from_id === myId ? 'bg-emerald-400 text-[#0b1020]' : 'bg-white text-[#0b1020]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
          placeholder="Écris un message..."
          className="flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
        />
        <button
          type="button"
          onClick={handleSend}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 text-[#0b1020] hover:opacity-90"
        >
          <Send size={16} />
        </button>
      </div>
      </div>
    </div>
  )
}

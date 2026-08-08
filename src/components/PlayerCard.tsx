import { BadgeCheck, MessageCircle } from 'lucide-react'
import { sportEmoji } from '../data/sports'
import type { Profile } from '../types'

export function PlayerCard({
  profile,
  isFollowing,
  onMessage,
  onToggleFollow,
}: {
  profile: Profile
  isFollowing: boolean
  onMessage: () => void
  onToggleFollow: () => void
}) {
  return (
    <div className="flex w-40 flex-shrink-0 flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-3">
      <div className="relative">
        <img
          src={profile.photo_url ?? undefined}
          alt={profile.pseudo}
          className="h-24 w-full rounded-2xl object-cover"
        />
        {profile.certified && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-[#0b1020]/80 p-0.5">
            <BadgeCheck size={16} className="text-sky-400" />
          </span>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-white">{profile.pseudo}</p>
      <p className="truncate text-xs text-white/40">
        {profile.sports.slice(0, 3).map((s) => sportEmoji(s)).join(' ')}
      </p>

      <div className="mt-3 flex gap-1.5">
        <button
          type="button"
          onClick={onMessage}
          className="flex flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 py-1.5 text-white/70 hover:bg-white/10"
        >
          <MessageCircle size={14} />
        </button>
        <button
          type="button"
          onClick={onToggleFollow}
          className={`flex-1 rounded-full py-1.5 text-[11px] font-semibold transition-colors ${
            isFollowing ? 'bg-white/10 text-white/60' : 'bg-emerald-400 text-[#0b1020]'
          }`}
        >
          {isFollowing ? 'Suivi' : 'Suivre'}
        </button>
      </div>
    </div>
  )
}

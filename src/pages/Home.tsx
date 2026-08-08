import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { follow, joinEvent, listEvents, listFollowingIds, listNearbyProfiles, unfollow } from '../api/entities'
import { useProfile } from '../hooks/useProfile'
import { SectionTitle } from '../components/SectionTitle'
import { EventCard } from '../components/EventCard'
import { PlayerCard } from '../components/PlayerCard'

export function Home() {
  const { profile, userId } = useProfile()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const eventsQuery = useQuery({ queryKey: ['events'], queryFn: listEvents })
  const playersQuery = useQuery({
    queryKey: ['nearby-profiles', userId],
    queryFn: () => listNearbyProfiles(userId as string),
    enabled: Boolean(userId),
  })
  const followingQuery = useQuery({
    queryKey: ['following', userId],
    queryFn: () => listFollowingIds(userId as string),
    enabled: Boolean(userId),
  })

  const joinMutation = useMutation({
    mutationFn: joinEvent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const followMutation = useMutation({
    mutationFn: async (targetId: string) => {
      if (!userId) return
      if (followingQuery.data?.includes(targetId)) await unfollow(userId, targetId)
      else await follow(userId, targetId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['following', userId] }),
  })

  if (!profile) return null

  const events = eventsQuery.data ?? []
  const alerts = events.filter((e) => e.status === 'en_cours' || e.status === 'urgent')
  const tournaments = events.filter((e) => e.kind === 'tournoi')
  const players = playersQuery.data ?? []
  const followingIds = followingQuery.data ?? []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">
          Salut <span className="text-emerald-400">{profile.pseudo}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Rayon de {profile.radius_km} km · {profile.sports.length} sport{profile.sports.length > 1 ? 's' : ''}{' '}
          pratiqué{profile.sports.length > 1 ? 's' : ''}
        </p>
      </div>

      <section>
        <SectionTitle>Alertes sport</SectionTitle>
        {alerts.length === 0 && <p className="text-sm text-white/40">Aucune alerte pour le moment.</p>}
        <div className="space-y-3">
          {alerts.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              joined={userId ? event.participants.includes(userId) : false}
              onJoin={() => joinMutation.mutate(event.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Tournois actuels</SectionTitle>
        {tournaments.length === 0 && <p className="text-sm text-white/40">Aucun tournoi en ce moment.</p>}
        <div className="space-y-3">
          {tournaments.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              joined={userId ? event.participants.includes(userId) : false}
              onJoin={() => joinMutation.mutate(event.id)}
            />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Joueurs près de toi</SectionTitle>
        {players.length === 0 && <p className="text-sm text-white/40">Aucun joueur trouvé pour l'instant.</p>}
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {players.map((p) => (
            <PlayerCard
              key={p.id}
              profile={p}
              isFollowing={followingIds.includes(p.id)}
              onMessage={() => navigate(`/messages?with=${p.id}`)}
              onToggleFollow={() => followMutation.mutate(p.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

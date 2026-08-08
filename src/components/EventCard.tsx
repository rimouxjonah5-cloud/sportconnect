import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Sparkles, Users } from 'lucide-react'
import { sportEmoji } from '../data/sports'
import type { SportEvent } from '../types'

const KIND_LABELS: Record<string, string> = {
  seance: 'Séance',
  match: 'Match',
  tournoi: 'Tournoi',
  sortie: 'Sortie',
}

export function EventCard({
  event,
  joined,
  onJoin,
}: {
  event: SportEvent
  joined?: boolean
  onJoin?: () => void
}) {
  const participantCount = event.participants?.length ?? 0
  const isFull = event.max_players != null && participantCount >= event.max_players

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{sportEmoji(event.sport)}</span>
          <div>
            <p className="font-semibold text-white">{event.title}</p>
            <p className="text-xs text-white/50">
              {KIND_LABELS[event.kind]} · {event.location_name || event.address || 'Lieu à définir'}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {event.status === 'en_cours' && (
            <span className="animate-pulse-live rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400">
              En cours
            </span>
          )}
          {event.status === 'urgent' && (
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              Urgent
            </span>
          )}
          {event.boosted && <Sparkles size={14} className="text-emerald-400" />}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-white/50">
        <span>
          {format(parseISO(event.event_date), 'EEEE d MMMM', { locale: fr })} à {event.event_time.slice(0, 5)}
        </span>
        <span className="flex items-center gap-1">
          <Users size={13} />
          {participantCount}
          {event.max_players != null ? `/${event.max_players}` : ''}
        </span>
      </div>

      {onJoin && (
        <button
          type="button"
          onClick={onJoin}
          disabled={joined || isFull}
          className="mt-3 w-full rounded-full bg-emerald-400 py-2 text-sm font-semibold text-[#0b1020] transition hover:opacity-90 disabled:opacity-40"
        >
          {joined ? 'Inscrit' : isFull ? 'Complet' : 'Rejoindre'}
        </button>
      )}
    </div>
  )
}

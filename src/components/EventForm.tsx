import { useState, type FormEvent } from 'react'
import { format } from 'date-fns'
import { X } from 'lucide-react'
import { SPORTS } from '../data/sports'
import { createEvent } from '../api/entities'
import type { EventKind, EventStatus, Profile, SportEvent } from '../types'

const KINDS: { id: EventKind; label: string }[] = [
  { id: 'seance', label: 'Séance' },
  { id: 'match', label: 'Match' },
  { id: 'tournoi', label: 'Tournoi' },
  { id: 'sortie', label: 'Sortie' },
]

const STATUSES: { id: EventStatus; label: string }[] = [
  { id: 'prevu', label: 'Prévu' },
  { id: 'en_cours', label: 'En cours' },
  { id: 'urgent', label: 'Urgent' },
]

export function EventForm({
  date,
  profile,
  onClose,
  onCreated,
}: {
  date: Date
  profile: Profile
  onClose: () => void
  onCreated: (event: SportEvent) => void
}) {
  const [title, setTitle] = useState('')
  const [sport, setSport] = useState(SPORTS[0].id)
  const [time, setTime] = useState('18:00')
  const [kind, setKind] = useState<EventKind>('seance')
  const [status, setStatus] = useState<EventStatus>('prevu')
  const [locationName, setLocationName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('')
  const [teams, setTeams] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Donne un titre à ton évènement.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const event = await createEvent({
        host_id: profile.id,
        host_pseudo: profile.pseudo,
        title: title.trim(),
        sport,
        event_date: format(date, 'yyyy-MM-dd'),
        event_time: time,
        kind,
        status,
        location_name: locationName.trim(),
        address: '',
        description: description.trim(),
        max_players: maxPlayers ? Number(maxPlayers) : null,
        teams: teams.trim(),
      })
      onCreated(event)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-0">
      <div className="max-h-[90svh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0b1020] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Nouvel évènement</h2>
          <button type="button" onClick={onClose} className="text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
          />

          <div className="flex gap-3">
            <select
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            >
              {SPORTS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0b1020]">
                  {s.emoji} {s.label}
                </option>
              ))}
            </select>
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              type="time"
              className="w-36 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex gap-2">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKind(k.id)}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                  kind === k.id ? 'bg-emerald-400 text-[#0b1020]' : 'bg-white/[0.04] text-white/60'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStatus(s.id)}
                className={`flex-1 rounded-full py-2 text-xs font-semibold transition-colors ${
                  status === s.id ? 'bg-emerald-400 text-[#0b1020]' : 'bg-white/[0.04] text-white/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Lieu"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
          />

          <div className="flex gap-3">
            <input
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              type="number"
              min={1}
              placeholder="Joueurs max"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
            />
            <input
              value={teams}
              onChange={(e) => setTeams(e.target.value)}
              placeholder="Équipes"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-emerald-400 py-3 text-sm font-semibold text-[#0b1020] hover:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Publication...' : "Publier l'évènement"}
          </button>
        </form>
      </div>
    </div>
  )
}

import { Navigation, X } from 'lucide-react'
import { sportEmoji } from '../data/sports'
import type { Venue } from '../types'

export function VenueSheet({ venue, onClose }: { venue: Venue; onClose: () => void }) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.lat},${venue.lng}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-[#0b1020]">
        <div className="relative">
          <img src={venue.photo_url ?? undefined} alt={venue.name} className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
          >
            <X size={18} />
          </button>
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              venue.is_open ? 'bg-emerald-400 text-[#0b1020]' : 'bg-white/20 text-white'
            }`}
          >
            {venue.is_open ? 'Ouvert' : 'Fermé'}
          </span>
        </div>

        <div className="p-5">
          <h2 className="font-display text-lg font-bold text-white">{venue.name}</h2>
          <p className="mt-1 text-sm text-white/50">{venue.address}</p>
          {venue.hours && <p className="mt-1 text-xs text-white/40">Horaires : {venue.hours}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            {venue.sports.map((s) => (
              <span key={s} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/70">
                {sportEmoji(s)} {s}
              </span>
            ))}
          </div>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 py-3 text-sm font-semibold text-[#0b1020] hover:opacity-90"
          >
            <Navigation size={16} />
            Itinéraire GPS
          </a>
        </div>
      </div>
    </div>
  )
}

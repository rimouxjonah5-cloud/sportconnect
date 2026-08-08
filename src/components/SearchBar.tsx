import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchProfiles, searchVenues } from '../api/entities'
import { useProfile } from '../hooks/useProfile'
import type { Profile, Venue } from '../types'

type Tab = 'amis' | 'complexes'

export function SearchBar() {
  const { userId } = useProfile()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('amis')
  const [query, setQuery] = useState('')
  const [profileResults, setProfileResults] = useState<Profile[]>([])
  const [venueResults, setVenueResults] = useState<Venue[]>([])

  useEffect(() => {
    let active = true
    const q = query.trim()
    if (!q) {
      setProfileResults([])
      setVenueResults([])
      return
    }
    const timeout = setTimeout(() => {
      if (tab === 'amis') {
        searchProfiles(q, userId ?? '').then((r) => active && setProfileResults(r))
      } else {
        searchVenues(q).then((r) => active && setVenueResults(r))
      }
    }, 250)
    return () => {
      active = false
      clearTimeout(timeout)
    }
  }, [query, tab, userId])

  function openProfile(p: Profile) {
    setQuery('')
    navigate(`/messages?with=${p.id}`)
  }

  function openVenue(v: Venue) {
    setQuery('')
    navigate(`/plan?venue=${v.id}`)
  }

  const results = tab === 'amis' ? profileResults : venueResults

  return (
    <div className="w-full">
      <div className="mb-2 flex gap-1 rounded-full bg-white/[0.04] p-1">
        <button
          type="button"
          onClick={() => setTab('amis')}
          className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
            tab === 'amis' ? 'bg-emerald-400 text-[#0b1020]' : 'text-white/50'
          }`}
        >
          Amis
        </button>
        <button
          type="button"
          onClick={() => setTab('complexes')}
          className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors ${
            tab === 'complexes' ? 'bg-emerald-400 text-[#0b1020]' : 'text-white/50'
          }`}
        >
          Complexes
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === 'amis' ? 'Rechercher un pseudo, un prénom...' : 'Rechercher un complexe, une adresse...'}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
        />

        {query.trim() && (
          <div className="absolute inset-x-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-white/10 bg-[#0b1020] shadow-xl">
            {results.length === 0 && <p className="px-4 py-3 text-sm text-white/40">Aucun résultat.</p>}
            {tab === 'amis'
              ? profileResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => openProfile(p)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5"
                  >
                    <img
                      src={p.photo_url ?? undefined}
                      alt={p.pseudo}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{p.pseudo}</p>
                      <p className="text-xs text-white/40">
                        {p.first_name} {p.last_name}
                      </p>
                    </div>
                  </button>
                ))
              : venueResults.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => openVenue(v)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5"
                  >
                    <img src={v.photo_url ?? undefined} alt={v.name} className="h-8 w-8 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-white">{v.name}</p>
                      <p className="text-xs text-white/40">{v.address}</p>
                    </div>
                  </button>
                ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { listFollowingIds, listProfilesByIds, listVenues } from '../api/entities'
import { useProfile } from '../hooks/useProfile'
import { useLiveGeolocation } from '../hooks/useLiveGeolocation'
import { VenueSheet } from '../components/VenueSheet'
import type { Venue } from '../types'

const DEFAULT_CENTER: [number, number] = [48.8566, 2.3522] // Paris

function circleIcon(photoUrl: string | null | undefined, borderColor: string): L.DivIcon {
  const bg = photoUrl
    ? `background-image:url('${photoUrl}');background-size:cover;background-position:center;`
    : 'background:#1f2937;'
  return L.divIcon({
    className: '',
    html: `<div style="width:36px;height:36px;border-radius:9999px;border:3px solid ${borderColor};${bg}box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

export function Plan() {
  const { profile, userId } = useProfile()
  const [searchParams, setSearchParams] = useSearchParams()
  const [openVenue, setOpenVenue] = useState<Venue | null>(null)

  useLiveGeolocation(userId, true)

  const venuesQuery = useQuery({ queryKey: ['venues'], queryFn: listVenues })
  const followingQuery = useQuery({
    queryKey: ['following', userId],
    queryFn: () => listFollowingIds(userId as string),
    enabled: Boolean(userId),
  })
  const friendsQuery = useQuery({
    queryKey: ['friends-positions', followingQuery.data],
    queryFn: () => listProfilesByIds(followingQuery.data ?? []),
    enabled: Boolean(followingQuery.data),
    refetchInterval: 15000,
  })

  const venues = useMemo(() => venuesQuery.data ?? [], [venuesQuery.data])
  const friends = (friendsQuery.data ?? []).filter((f) => f.lat != null && f.lng != null)

  useEffect(() => {
    const venueId = searchParams.get('venue')
    if (!venueId || venues.length === 0) return
    const venue = venues.find((v) => v.id === venueId)
    if (venue) setOpenVenue(venue)
  }, [searchParams, venues])

  const center = useMemo<[number, number]>(() => {
    if (profile?.lat != null && profile?.lng != null) return [profile.lat, profile.lng]
    return DEFAULT_CENTER
  }, [profile])

  function closeVenue() {
    setOpenVenue(null)
    if (searchParams.get('venue')) {
      searchParams.delete('venue')
      setSearchParams(searchParams, { replace: true })
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-white/10" style={{ height: '60vh' }}>
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {venues.map((venue) => (
            <Marker
              key={venue.id}
              position={[venue.lat, venue.lng]}
              icon={circleIcon(venue.photo_url, '#34d399')}
              eventHandlers={{ click: () => setOpenVenue(venue) }}
            />
          ))}
          {friends.map((friend) => (
            <Marker
              key={friend.id}
              position={[friend.lat as number, friend.lng as number]}
              icon={circleIcon(friend.photo_url, '#38bdf8')}
            />
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-emerald-400" /> Complexes sportifs
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2 border-sky-400" /> Amis suivis
        </span>
      </div>

      {openVenue && <VenueSheet venue={openVenue} onClose={closeVenue} />}
    </div>
  )
}

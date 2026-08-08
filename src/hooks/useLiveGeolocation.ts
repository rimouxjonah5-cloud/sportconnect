import { useEffect, useState } from 'react'
import { upsertLocation } from '../api/entities'

// Met à jour la position (table profile_locations) en direct via watchPosition
// et renvoie la dernière position connue localement.
export function useLiveGeolocation(profileId: string | null, enabled: boolean) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (!enabled || !profileId || !('geolocation' in navigator)) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setPosition({ lat, lng })
        upsertLocation(profileId, lat, lng).catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [profileId, enabled])

  return position
}

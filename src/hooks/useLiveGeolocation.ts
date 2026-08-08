import { useEffect } from 'react'
import { updateProfile } from '../api/entities'

// Met à jour lat/lng du profil courant en direct via watchPosition.
export function useLiveGeolocation(profileId: string | null, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !profileId || !('geolocation' in navigator)) return

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        updateProfile(profileId, { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [profileId, enabled])
}

export type EventKind = 'seance' | 'match' | 'tournoi' | 'sortie'
export type EventStatus = 'prevu' | 'en_cours' | 'urgent' | 'termine'
export type ShopItem = 'profile_boost' | 'certification' | 'event_boost'

export interface Profile {
  id: string
  pseudo: string
  first_name: string
  last_name: string
  age: number | null
  radius_km: number
  sports: string[]
  photo_url: string | null
  bio: string
  city: string
  lat: number | null
  lng: number | null
  onboarded: boolean
  certified: boolean
  profile_boost_until: string | null
  notifications_enabled: boolean
  sessions_count: number
  tournaments_count: number
  created_at: string
}

export interface SportEvent {
  id: string
  host_id: string
  host_pseudo: string
  title: string
  sport: string
  event_date: string // yyyy-MM-dd
  event_time: string // HH:mm:ss
  kind: EventKind
  status: EventStatus
  location_name: string
  address: string
  description: string
  max_players: number | null
  teams: string
  participants: string[]
  boosted: boolean
  created_at: string
}

export interface Venue {
  id: string
  name: string
  address: string
  photo_url: string | null
  lat: number
  lng: number
  sports: string[]
  is_private: boolean
  is_open: boolean
  hours: string
}

export interface VenueReview {
  id: string
  venue_id: string | null
  venue_name: string
  rating: number
  pros: string
  cons: string
  author_id: string
  author_pseudo: string
  created_at: string
}

export interface Message {
  id: string
  conversation_key: string
  from_id: string
  to_id: string
  from_pseudo: string
  text: string
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Purchase {
  id: string
  user_id: string
  item: ShopItem
  price: number
  event_id: string | null
  created_at: string
}

export interface Trophy {
  id: string
  name: string
  description: string
  icon: string
  isUnlocked: (profile: Profile) => boolean
}

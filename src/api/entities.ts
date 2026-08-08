import { supabase } from '../lib/supabaseClient'
import type { Message, Profile, Purchase, ShopItem, SportEvent, Venue, VenueReview } from '../types'

function client() {
  if (!supabase) throw new Error('Supabase non configuré : renseigne VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY')
  return supabase
}

// ============ PROFILES ============
export async function getProfile(id: string): Promise<Profile | null> {
  const { data, error } = await client().from('profiles').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export async function updateProfile(id: string, patch: Partial<Profile>): Promise<Profile> {
  const { data, error } = await client().from('profiles').update(patch).eq('id', id).select('*').single()
  if (error) throw error
  return data as Profile
}

export async function listNearbyProfiles(excludeId: string): Promise<Profile[]> {
  const { data, error } = await client().from('profiles').select('*').neq('id', excludeId).eq('onboarded', true)
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function listProfilesByIds(ids: string[]): Promise<Profile[]> {
  if (ids.length === 0) return []
  const { data, error } = await client().from('profiles').select('*').in('id', ids)
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function searchProfiles(query: string, excludeId: string): Promise<Profile[]> {
  const escaped = query.replace(/[%_\\]/g, (c) => `\\${c}`)
  const { data, error } = await client()
    .from('profiles')
    .select('*')
    .or(`pseudo.ilike.%${escaped}%,first_name.ilike.%${escaped}%,last_name.ilike.%${escaped}%`)
    .neq('id', excludeId)
    .limit(15)
  if (error) throw error
  return (data ?? []) as Profile[]
}

// ============ SPORT EVENTS ============
export async function listEvents(): Promise<SportEvent[]> {
  const { data, error } = await client()
    .from('sport_events')
    .select('*')
    .order('boosted', { ascending: false })
    .order('event_date', { ascending: true })
    .order('event_time', { ascending: true })
  if (error) throw error
  return (data ?? []) as SportEvent[]
}

export async function createEvent(
  payload: Omit<SportEvent, 'id' | 'created_at' | 'boosted' | 'participants'>,
): Promise<SportEvent> {
  const { data, error } = await client()
    .from('sport_events')
    .insert({ ...payload, participants: [payload.host_id] })
    .select('*')
    .single()
  if (error) throw error
  return data as SportEvent
}

export async function joinEvent(eventId: string): Promise<void> {
  const { error } = await client().rpc('join_event', { target_event_id: eventId })
  if (error) throw error
}

// ============ VENUES ============
export async function listVenues(): Promise<Venue[]> {
  const { data, error } = await client().from('venues').select('*')
  if (error) throw error
  return (data ?? []) as Venue[]
}

export async function searchVenues(query: string): Promise<Venue[]> {
  const escaped = query.replace(/[%_\\]/g, (c) => `\\${c}`)
  const { data, error } = await client()
    .from('venues')
    .select('*')
    .or(`name.ilike.%${escaped}%,address.ilike.%${escaped}%`)
    .limit(15)
  if (error) throw error
  return (data ?? []) as Venue[]
}

// ============ VENUE REVIEWS ============
export async function listReviews(): Promise<VenueReview[]> {
  const { data, error } = await client().from('venue_reviews').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as VenueReview[]
}

export async function createReview(
  payload: Omit<VenueReview, 'id' | 'created_at' | 'venue_id'>,
): Promise<VenueReview> {
  const { data, error } = await client().from('venue_reviews').insert(payload).select('*').single()
  if (error) throw error
  return data as VenueReview
}

// ============ FOLLOWS ============
export async function listFollowingIds(followerId: string): Promise<string[]> {
  const { data, error } = await client().from('follows').select('following_id').eq('follower_id', followerId)
  if (error) throw error
  return (data ?? []).map((r) => r.following_id as string)
}

export async function follow(followerId: string, followingId: string): Promise<void> {
  const { error } = await client().from('follows').insert({ follower_id: followerId, following_id: followingId })
  if (error) throw error
}

export async function unfollow(followerId: string, followingId: string): Promise<void> {
  const { error } = await client()
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  if (error) throw error
}

export async function countFollowers(profileId: string): Promise<number> {
  const { count, error } = await client()
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profileId)
  if (error) throw error
  return count ?? 0
}

// ============ MESSAGES ============
export function conversationKey(a: string, b: string): string {
  return [a, b].sort().join(':')
}

export async function listMessages(key: string): Promise<Message[]> {
  const { data, error } = await client()
    .from('messages')
    .select('*')
    .eq('conversation_key', key)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Message[]
}

export async function sendMessage(payload: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
  const { data, error } = await client().from('messages').insert(payload).select('*').single()
  if (error) throw error
  return data as Message
}

// ============ PURCHASES ============
export async function applyPurchase(item: ShopItem, price: number): Promise<void> {
  const { error } = await client().rpc('apply_purchase', { target_item: item, target_price: price })
  if (error) throw error
}

export async function listPurchases(userId: string): Promise<Purchase[]> {
  const { data, error } = await client()
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Purchase[]
}

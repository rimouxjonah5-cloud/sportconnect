import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile as updateProfileApi } from '../api/entities'
import type { Profile } from '../types'
import { useSession } from './useSession'

export function useProfile() {
  const session = useSession()
  const userId = session && session !== 'loading' ? session.user.id : null
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => getProfile(userId as string),
    enabled: Boolean(userId),
  })

  async function updateProfile(patch: Partial<Profile>) {
    if (!userId) return
    const updated = await updateProfileApi(userId, patch)
    queryClient.setQueryData(['profile', userId], updated)
    return updated
  }

  return {
    session,
    userId,
    profile: (query.data ?? null) as Profile | null,
    isLoading: session === 'loading' || (Boolean(userId) && query.isLoading),
    updateProfile,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['profile', userId] }),
  }
}

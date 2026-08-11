import { useQuery } from '@tanstack/react-query'
import { isAdmin } from '../api/entities'
import { useSession } from './useSession'

export function useIsAdmin(): boolean {
  const session = useSession()
  const enabled = Boolean(session && session !== 'loading')

  const query = useQuery({
    queryKey: ['is-admin'],
    queryFn: isAdmin,
    enabled,
  })

  return query.data ?? false
}

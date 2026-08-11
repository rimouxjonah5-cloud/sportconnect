import { Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { getAdminUserCount } from '../api/entities'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { SectionTitle } from '../components/SectionTitle'

export function Admin() {
  const isAdmin = useIsAdmin()

  const countQuery = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: getAdminUserCount,
    enabled: isAdmin,
    refetchInterval: 5000,
  })

  if (!isAdmin) return <Navigate to="/profil" replace />

  return (
    <div className="space-y-6">
      <SectionTitle>Admin</SectionTitle>
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
        <Users size={28} className="text-emerald-400" />
        <p className="font-display text-4xl font-extrabold text-white">{countQuery.data ?? '—'}</p>
        <p className="text-sm text-white/50">personnes inscrites sur Sport Connect</p>
      </div>
    </div>
  )
}

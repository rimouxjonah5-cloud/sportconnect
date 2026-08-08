import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../hooks/useSession'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const session = useSession()

  if (session === 'loading') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#070b16]">
        <p className="text-sm text-white/40">Chargement...</p>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}

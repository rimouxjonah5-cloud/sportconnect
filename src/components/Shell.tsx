import { Navigate, Outlet } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export function Shell() {
  const { profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#070b16]">
        <p className="text-sm text-white/40">Chargement...</p>
      </div>
    )
  }

  if (!profile || !profile.onboarded) return <Navigate to="/bienvenue" replace />

  return (
    <div className="relative mx-auto min-h-svh w-full max-w-lg bg-[#070b16]">
      <TopBar />
      <main className="px-4 pt-40 pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

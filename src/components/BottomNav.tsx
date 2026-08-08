import { NavLink } from 'react-router-dom'
import { CalendarDays, MapPin, MessageCircle, Star, User } from 'lucide-react'

const linkBase = 'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium'

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex w-full max-w-lg items-end border-t border-white/10 bg-[#0b1020]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <NavLink
        to="/plan"
        className={({ isActive }) => `${linkBase} ${isActive ? 'text-emerald-400' : 'text-white/50'}`}
      >
        <MapPin size={20} />
        Plan
      </NavLink>
      <NavLink
        to="/messages"
        className={({ isActive }) => `${linkBase} ${isActive ? 'text-emerald-400' : 'text-white/50'}`}
      >
        <MessageCircle size={20} />
        Messages
      </NavLink>

      <div className="flex flex-1 justify-center">
        <NavLink to="/calendrier" className="-mt-6 flex flex-col items-center gap-1">
          {({ isActive }) => (
            <>
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-900/40 ring-4 ring-[#0b1020] ${
                  isActive ? 'opacity-100' : 'opacity-90'
                }`}
              >
                <CalendarDays size={24} className="text-[#0b1020]" />
              </span>
              <span className={`text-[11px] font-medium ${isActive ? 'text-emerald-400' : 'text-white/50'}`}>
                Planning
              </span>
            </>
          )}
        </NavLink>
      </div>

      <NavLink
        to="/avis"
        className={({ isActive }) => `${linkBase} ${isActive ? 'text-emerald-400' : 'text-white/50'}`}
      >
        <Star size={20} />
        Avis
      </NavLink>
      <NavLink
        to="/profil"
        className={({ isActive }) => `${linkBase} ${isActive ? 'text-emerald-400' : 'text-white/50'}`}
      >
        <User size={20} />
        Profil
      </NavLink>
    </nav>
  )
}

import { Link } from 'react-router-dom'
import { Home, Store } from 'lucide-react'
import { SearchBar } from './SearchBar'

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto w-full max-w-lg border-b border-white/10 bg-[#070b16]/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="flex items-center justify-between py-3">
        <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/5">
          <Home size={20} />
        </Link>
        <h1 className="font-display text-sm font-extrabold tracking-[0.2em] text-white">SPORT CONNECT</h1>
        <Link
          to="/boutique"
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/5"
        >
          <Store size={20} />
        </Link>
      </div>
      <div className="pb-3">
        <SearchBar />
      </div>
    </header>
  )
}

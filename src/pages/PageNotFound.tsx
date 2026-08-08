import { Link } from 'react-router-dom'

export function PageNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#070b16] px-6 text-center">
      <p className="font-display text-6xl font-extrabold text-emerald-400">404</p>
      <p className="mt-2 text-white/60">Cette page n'existe pas.</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#0b1020] hover:opacity-90"
      >
        Retour à l'accueil
      </Link>
    </div>
  )
}

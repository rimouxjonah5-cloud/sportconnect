import type { InputHTMLAttributes, ReactNode } from 'react'

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#070b16] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-white">
            SPORT <span className="text-emerald-400">CONNECT</span>
          </h1>
          <p className="mt-3 text-lg font-semibold text-white">{title}</p>
          {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}

export function AuthField(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
    />
  )
}

export function AuthSubmit({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="mt-2 w-full rounded-full bg-emerald-400 py-3 text-sm font-semibold text-[#0b1020] shadow-lg shadow-emerald-900/30 transition hover:opacity-90 disabled:opacity-50"
    >
      {busy ? 'Un instant...' : children}
    </button>
  )
}

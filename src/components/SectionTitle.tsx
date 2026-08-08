import type { ReactNode } from 'react'

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-display text-base font-bold text-white">{children}</h2>
      {action}
    </div>
  )
}

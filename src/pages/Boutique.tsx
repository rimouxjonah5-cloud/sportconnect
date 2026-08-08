import { useState, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, Sparkles, Zap } from 'lucide-react'
import { applyPurchase } from '../api/entities'
import { useProfile } from '../hooks/useProfile'
import type { ShopItem } from '../types'

interface Product {
  item: ShopItem
  title: string
  description: string
  price: number
  icon: ReactNode
}

const PRODUCTS: Product[] = [
  {
    item: 'profile_boost',
    title: 'Boost de profil',
    description: 'Ton profil est mis en avant pendant 24h auprès des autres sportifs.',
    price: 0.99,
    icon: <Zap size={22} className="text-emerald-400" />,
  },
  {
    item: 'certification',
    title: 'Badge de certification',
    description: 'Affiche un badge de certification bleu sur ton profil, à vie.',
    price: 2.99,
    icon: <BadgeCheck size={22} className="text-sky-400" />,
  },
  {
    item: 'event_boost',
    title: "Boost d'évènement",
    description: "Ton dernier évènement passe en tête de liste et gagne un badge boosté.",
    price: 0.99,
    icon: <Sparkles size={22} className="text-amber-400" />,
  },
]

export function Boutique() {
  const { profile } = useProfile()
  const queryClient = useQueryClient()
  const [justPurchased, setJustPurchased] = useState<ShopItem | null>(null)

  const purchaseMutation = useMutation({
    mutationFn: (product: Product) => applyPurchase(product.item, product.price),
    onSuccess: (_data, product) => {
      setJustPurchased(product.item)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setTimeout(() => setJustPurchased(null), 3000)
    },
  })

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-white">Boutique</h1>
        <p className="mt-1 text-sm text-white/50">Paiement non connecté — l'activation est immédiate pour la démo.</p>
      </div>

      <div className="space-y-3">
        {PRODUCTS.map((product) => (
          <div key={product.item} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/[0.06]">
                {product.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{product.title}</p>
                <p className="mt-0.5 text-xs text-white/50">{product.description}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => purchaseMutation.mutate(product)}
              disabled={purchaseMutation.isPending}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 py-2.5 text-sm font-semibold text-[#0b1020] hover:opacity-90 disabled:opacity-50"
            >
              {justPurchased === product.item ? 'Activé !' : `Acheter — ${product.price.toFixed(2)} €`}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

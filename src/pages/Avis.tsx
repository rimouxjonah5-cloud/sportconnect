import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Star, ThumbsDown, ThumbsUp } from 'lucide-react'
import { createReview, listReviews } from '../api/entities'
import { useProfile } from '../hooks/useProfile'
import { SectionTitle } from '../components/SectionTitle'

export function Avis() {
  const { profile } = useProfile()
  const queryClient = useQueryClient()
  const reviewsQuery = useQuery({ queryKey: ['reviews'], queryFn: listReviews })

  const [venueName, setVenueName] = useState('')
  const [rating, setRating] = useState(5)
  const [pros, setPros] = useState('')
  const [cons, setCons] = useState('')
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      setVenueName('')
      setRating(5)
      setPros('')
      setCons('')
    },
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    if (!venueName.trim()) {
      setError('Indique le nom du complexe.')
      return
    }
    setError('')
    createMutation.mutate({
      venue_name: venueName.trim(),
      rating,
      pros: pros.trim(),
      cons: cons.trim(),
      author_id: profile.id,
      author_pseudo: profile.pseudo,
    })
  }

  return (
    <div className="space-y-8">
      <section>
        <SectionTitle>Laisser un avis</SectionTitle>
        <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="Nom du complexe"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
          />

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} className="p-0.5">
                <Star size={22} className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'} />
              </button>
            ))}
          </div>

          <textarea
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="Qualités"
            rows={2}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
          />
          <textarea
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder="Défauts"
            rows={2}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="w-full rounded-full bg-emerald-400 py-3 text-sm font-semibold text-[#0b1020] hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Publication...' : "Publier l'avis"}
          </button>
        </form>
      </section>

      <section>
        <SectionTitle>Avis de la communauté</SectionTitle>
        <div className="space-y-3">
          {(reviewsQuery.data ?? []).map((review) => (
            <div key={review.id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-white">{review.venue_name}</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className={n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-white/20'}
                    />
                  ))}
                </div>
              </div>
              {review.pros && (
                <p className="mt-2 flex items-start gap-2 text-sm text-emerald-400">
                  <ThumbsUp size={14} className="mt-0.5 flex-shrink-0" /> {review.pros}
                </p>
              )}
              {review.cons && (
                <p className="mt-1 flex items-start gap-2 text-sm text-red-400">
                  <ThumbsDown size={14} className="mt-0.5 flex-shrink-0" /> {review.cons}
                </p>
              )}
              <p className="mt-2 text-xs text-white/40">
                {review.author_pseudo} · {format(parseISO(review.created_at), 'd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

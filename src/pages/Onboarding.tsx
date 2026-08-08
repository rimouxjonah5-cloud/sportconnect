import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useProfile } from '../hooks/useProfile'
import { SPORTS } from '../data/sports'

const TOTAL_STEPS = 3

export function Onboarding() {
  const { profile, isLoading, updateProfile } = useProfile()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [pseudo, setPseudo] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [age, setAge] = useState('')
  const [radiusKm, setRadiusKm] = useState(15)
  const [sports, setSports] = useState<string[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[#070b16]">
        <p className="text-sm text-white/40">Chargement...</p>
      </div>
    )
  }

  if (profile?.onboarded) return <Navigate to="/" replace />

  function toggleSport(id: string) {
    setSports((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function goNext() {
    setError('')
    if (step === 1) {
      if (!pseudo.trim() || !firstName.trim() || !lastName.trim() || !age) {
        setError('Merci de remplir tous les champs.')
        return
      }
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      return
    }
    void finish()
  }

  async function finish() {
    if (sports.length === 0) {
      setError('Choisis au moins un sport.')
      return
    }
    setBusy(true)
    try {
      await updateProfile({
        pseudo: pseudo.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        age: Number(age),
        radius_km: radiusKm,
        sports,
        onboarded: true,
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-[#070b16] px-6 py-10">
      <div className="mx-auto w-full max-w-lg flex-1">
        <h1 className="font-display text-center text-2xl font-extrabold tracking-tight text-white">
          Bienvenue sur <span className="text-emerald-400">Sport Connect</span>
        </h1>

        <div className="mt-6 flex gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < step ? 'bg-emerald-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="mt-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Qui es-tu ?</h2>
              <input
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Pseudo"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
              />
              <div className="flex gap-3">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Prénom"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Nom"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
                />
              </div>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                type="number"
                min={13}
                max={99}
                placeholder="Âge"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-emerald-400"
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Ton rayon de déplacement</h2>
              <p className="text-sm text-white/50">Distance max pour trouver des sportifs et des matchs.</p>
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center">
                <p className="font-display text-4xl font-extrabold text-emerald-400">{radiusKm} km</p>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="mt-6 w-full accent-emerald-400"
                />
                <div className="mt-2 flex justify-between text-xs text-white/40">
                  <span>0 km</span>
                  <span>50 km</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Tes sports</h2>
              <p className="text-sm text-white/50">Sélectionne au moins un sport.</p>
              <div className="grid grid-cols-4 gap-2">
                {SPORTS.map((sport) => {
                  const selected = sports.includes(sport.id)
                  return (
                    <button
                      key={sport.id}
                      type="button"
                      onClick={() => toggleSport(sport.id)}
                      className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-colors ${
                        selected
                          ? 'border-emerald-400 bg-emerald-400/10'
                          : 'border-white/10 bg-white/[0.04] hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{sport.emoji}</span>
                      <span className="text-[11px] leading-tight text-white/80">{sport.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </div>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-lg gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white/70 hover:bg-white/10"
          >
            Retour
          </button>
        )}
        <button
          type="button"
          onClick={goNext}
          disabled={busy}
          className="flex-1 rounded-full bg-emerald-400 py-3 text-sm font-semibold text-[#0b1020] shadow-lg shadow-emerald-900/30 hover:opacity-90 disabled:opacity-50"
        >
          {busy ? 'Un instant...' : step < TOTAL_STEPS ? 'Continuer' : 'Terminer'}
        </button>
      </div>
    </div>
  )
}

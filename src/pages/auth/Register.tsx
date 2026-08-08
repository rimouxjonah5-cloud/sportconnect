import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../hooks/useSession'
import { AuthField, AuthLayout, AuthSubmit } from '../../components/AuthLayout'

export function Register() {
  const session = useSession()
  const navigate = useNavigate()
  const [pseudo, setPseudo] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmPending, setConfirmPending] = useState(false)

  if (session && session !== 'loading') return <Navigate to="/bienvenue" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase non configuré.')
      return
    }
    if (!pseudo.trim()) {
      setError('Choisis un pseudo')
      return
    }
    setError('')
    setBusy(true)
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { pseudo: pseudo.trim() } },
      })
      if (err) throw err
      if (data.session) navigate('/bienvenue')
      else setConfirmPending(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  if (confirmPending) {
    return (
      <AuthLayout title="Vérifie ta boîte mail">
        <p className="text-center text-sm text-white/60">
          On a envoyé un lien de confirmation à <span className="text-white">{email}</span>. Clique dessus pour
          activer ton compte, puis reviens te connecter.
        </p>
        <Link
          to="/login"
          className="mt-6 block rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-center text-sm text-white/70 hover:bg-white/10"
        >
          Retour à la connexion
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoins la communauté sportive">
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthField value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Pseudo" required />
        <AuthField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
        />
        <AuthField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Mot de passe"
          minLength={6}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <AuthSubmit busy={busy}>Créer mon compte</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-semibold text-emerald-400 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}

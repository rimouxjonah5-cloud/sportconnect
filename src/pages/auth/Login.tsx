import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useSession } from '../../hooks/useSession'
import { AuthField, AuthLayout, AuthSubmit } from '../../components/AuthLayout'

export function Login() {
  const session = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (session && session !== 'loading') return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase non configuré.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Connexion" subtitle="Content de te revoir">
      <form onSubmit={handleSubmit} className="space-y-3">
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
          required
        />
        <div className="text-right">
          <Link to="/forgot-password" className="text-xs text-emerald-400 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <AuthSubmit busy={busy}>Se connecter</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        Pas encore de compte ?{' '}
        <Link to="/register" className="font-semibold text-emerald-400 hover:underline">
          Créer un compte
        </Link>
      </p>
    </AuthLayout>
  )
}

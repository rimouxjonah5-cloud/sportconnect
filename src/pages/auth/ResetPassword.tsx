import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { AuthField, AuthLayout, AuthSubmit } from '../../components/AuthLayout'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase non configuré.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password })
      if (err) throw err
      setDone(true)
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <AuthLayout title="Mot de passe mis à jour">
        <p className="text-center text-sm text-white/60">Redirection en cours...</p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Choisis un mot de passe pour ton compte">
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthField
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Nouveau mot de passe"
          minLength={6}
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <AuthSubmit busy={busy}>Valider</AuthSubmit>
      </form>
    </AuthLayout>
  )
}

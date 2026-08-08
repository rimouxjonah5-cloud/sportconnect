import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { AuthField, AuthLayout, AuthSubmit } from '../../components/AuthLayout'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) {
      setError('Supabase non configuré.')
      return
    }
    setError('')
    setBusy(true)
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}#/reset-password`
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (err) throw err
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout title="Vérifie ta boîte mail">
        <p className="text-center text-sm text-white/60">
          Si un compte existe pour <span className="text-white">{email}</span>, un lien de réinitialisation vient
          de t'être envoyé.
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
    <AuthLayout title="Mot de passe oublié" subtitle="On t'envoie un lien de réinitialisation">
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthField
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <AuthSubmit busy={busy}>Envoyer le lien</AuthSubmit>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        <Link to="/login" className="font-semibold text-emerald-400 hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  )
}

import { useRef, useState, type ChangeEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BadgeCheck, Camera, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useProfile } from '../hooks/useProfile'
import { countFollowers, listFollowingIds } from '../api/entities'
import { SPORTS } from '../data/sports'
import { TROPHIES } from '../data/trophies'
import { SectionTitle } from '../components/SectionTitle'

export function Profil() {
  const { profile, userId, updateProfile } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const [pseudoDraft, setPseudoDraft] = useState<string | null>(null)

  const followersQuery = useQuery({
    queryKey: ['followers-count', userId],
    queryFn: () => countFollowers(userId as string),
    enabled: Boolean(userId),
  })
  const followingQuery = useQuery({
    queryKey: ['following', userId],
    queryFn: () => listFollowingIds(userId as string),
    enabled: Boolean(userId),
  })

  if (!profile || !userId) return null

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !supabase) return
    setUploading(true)
    try {
      const path = `${userId}/avatar-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('photos').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('photos').getPublicUrl(path)
      await updateProfile({ photo_url: data.publicUrl })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function toggleSport(id: string) {
    const sports = profile!.sports.includes(id)
      ? profile!.sports.filter((s) => s !== id)
      : [...profile!.sports, id]
    updateProfile({ sports })
  }

  async function handleLogout() {
    await supabase?.auth.signOut()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={profile.photo_url ?? undefined}
            alt={profile.pseudo}
            className="h-24 w-24 rounded-full border-2 border-white/10 object-cover"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-[#0b1020] shadow-lg"
          >
            <Camera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <p className="font-display text-xl font-bold text-white">{profile.pseudo}</p>
          {profile.certified && <BadgeCheck size={18} className="text-sky-400" />}
        </div>
        <p className="text-sm text-white/50">
          {profile.first_name} {profile.last_name} · {profile.age ?? '—'} ans
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Abonnés" value={followersQuery.data ?? 0} />
        <StatCard label="Abonnements" value={(followingQuery.data ?? []).length} />
        <StatCard label="Séances" value={profile.sessions_count} />
      </div>

      <section>
        <SectionTitle>Trophées</SectionTitle>
        <div className="grid grid-cols-5 gap-2">
          {TROPHIES.map((trophy) => {
            const unlocked = trophy.isUnlocked(profile)
            return (
              <div
                key={trophy.id}
                title={trophy.description}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-2.5 text-center ${
                  unlocked ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-white/10 bg-white/[0.02] opacity-40'
                }`}
              >
                <span className="text-xl">{trophy.icon}</span>
                <span className="text-[9px] leading-tight text-white/70">{trophy.name}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <SectionTitle>Paramètres</SectionTitle>
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div>
            <label className="mb-1 block text-xs text-white/50">Pseudo</label>
            <input
              value={pseudoDraft ?? profile.pseudo}
              onChange={(e) => setPseudoDraft(e.target.value)}
              onBlur={() => {
                if (pseudoDraft && pseudoDraft.trim() && pseudoDraft !== profile.pseudo) {
                  updateProfile({ pseudo: pseudoDraft.trim() })
                }
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-white/50">
              <span>Rayon de déplacement</span>
              <span className="text-emerald-400">{profile.radius_km} km</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              value={profile.radius_km}
              onChange={(e) => updateProfile({ radius_km: Number(e.target.value) })}
              className="w-full accent-emerald-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">Notifications</span>
            <button
              type="button"
              onClick={() => updateProfile({ notifications_enabled: !profile.notifications_enabled })}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors ${
                profile.notifications_enabled ? 'bg-emerald-400' : 'bg-white/15'
              }`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition-transform ${
                  profile.notifications_enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Mes sports</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {SPORTS.map((sport) => {
            const selected = profile.sports.includes(sport.id)
            return (
              <button
                key={sport.id}
                type="button"
                onClick={() => toggleSport(sport.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400'
                    : 'border-white/10 bg-white/[0.04] text-white/60'
                }`}
              >
                {sport.emoji} {sport.label}
              </button>
            )
          })}
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-3 text-sm font-semibold text-white/70 hover:bg-white/10"
      >
        <LogOut size={16} />
        Déconnexion
      </button>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-center">
      <p className="font-display text-lg font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/50">{label}</p>
    </div>
  )
}

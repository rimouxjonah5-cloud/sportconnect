import type { Profile, Trophy } from '../types'

export const TROPHIES: Trophy[] = [
  {
    id: 'first-step',
    name: 'Premier pas',
    description: '1 séance jouée',
    icon: '🥉',
    isUnlocked: (p: Profile) => p.sessions_count >= 1,
  },
  {
    id: 'regular',
    name: 'Régulier',
    description: '5 séances jouées',
    icon: '🥈',
    isUnlocked: (p: Profile) => p.sessions_count >= 5,
  },
  {
    id: 'machine',
    name: 'Machine',
    description: '15 séances jouées',
    icon: '🥇',
    isUnlocked: (p: Profile) => p.sessions_count >= 15,
  },
  {
    id: 'competitor',
    name: 'Compétiteur',
    description: '1 tournoi joué',
    icon: '🏆',
    isUnlocked: (p: Profile) => p.tournaments_count >= 1,
  },
  {
    id: 'legend',
    name: 'Légende',
    description: '5 tournois joués',
    icon: '👑',
    isUnlocked: (p: Profile) => p.tournaments_count >= 5,
  },
]

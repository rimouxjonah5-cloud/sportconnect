export interface Sport {
  id: string
  label: string
  emoji: string
}

export const SPORTS: Sport[] = [
  { id: 'football', label: 'Football', emoji: '⚽' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'padel', label: 'Padel', emoji: '🎾' },
  { id: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { id: 'natation', label: 'Natation', emoji: '🏊' },
  { id: 'musculation', label: 'Musculation', emoji: '🏋️' },
  { id: 'course', label: 'Course à pied', emoji: '🏃' },
  { id: 'athletisme', label: 'Athlétisme', emoji: '🥇' },
  { id: 'cyclisme', label: 'Cyclisme', emoji: '🚴' },
  { id: 'boxe', label: 'Boxe', emoji: '🥊' },
  { id: 'judo', label: 'Judo', emoji: '🥋' },
  { id: 'escalade', label: 'Escalade', emoji: '🧗' },
  { id: 'yoga', label: 'Yoga', emoji: '🧘' },
  { id: 'danse', label: 'Danse', emoji: '💃' },
  { id: 'golf', label: 'Golf', emoji: '⛳' },
  { id: 'rugby', label: 'Rugby', emoji: '🏉' },
  { id: 'badminton', label: 'Badminton', emoji: '🏸' },
  { id: 'skateboard', label: 'Skateboard', emoji: '🛹' },
  { id: 'surf', label: 'Surf', emoji: '🏄' },
]

export function sportEmoji(id: string): string {
  return SPORTS.find((s) => s.id === id)?.emoji ?? '🏅'
}

export function sportLabel(id: string): string {
  return SPORTS.find((s) => s.id === id)?.label ?? id
}

const COLORS = ['#059669', '#0b1020', '#0d9488', '#065f46', '#164e63', '#047857']

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function avatarFor(name: string): string {
  const color = COLORS[hash(name) % COLORS.length]
  const letters = initials(name) || '?'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
    <rect width="120" height="120" rx="60" fill="${color}"/>
    <text x="50%" y="53%" font-family="system-ui, sans-serif" font-size="46" fill="#fff" text-anchor="middle" dominant-baseline="middle" font-weight="600">${letters}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function bannerFor(seed: string): string {
  const c1 = COLORS[hash(seed) % COLORS.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="240">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#000"/>
        <stop offset="100%" stop-color="${c1}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="240" fill="url(#g)"/>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

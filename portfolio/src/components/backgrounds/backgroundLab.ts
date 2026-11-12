// Background lab: compare WebGL backgrounds in the hero before picking one.
// It is on in development and in builds made with VITE_BG_LAB=1 (a Vercel
// preview); a normal production build always shows the displacement sphere.

export const BACKGROUND_PARAM = 'bg'

export const BACKGROUND_OPTIONS = [
  { id: 'sphere', label: 'Sphere' },
  { id: 'orb', label: 'Orb' },
  { id: 'galaxy', label: 'Galaxy' },
  { id: 'particles', label: 'Particles' },
  { id: 'topography', label: 'Topography' },
  { id: 'grid-scan', label: 'Grid Scan' },
] as const

export type BackgroundId = (typeof BACKGROUND_OPTIONS)[number]['id']

export const DEFAULT_BACKGROUND: BackgroundId = 'sphere'

export interface LabEnv {
  DEV: boolean
  VITE_BG_LAB?: string
}

export function isBackgroundId(value: string | null): value is BackgroundId {
  return BACKGROUND_OPTIONS.some((option) => option.id === value)
}

/** The background named by `?bg=`, or the sphere when it is missing or unknown. */
export function parseBackgroundId(search: string): BackgroundId {
  const value = new URLSearchParams(search).get(BACKGROUND_PARAM)
  return isBackgroundId(value) ? value : DEFAULT_BACKGROUND
}

/** A copy of `search` naming `id`; the default background leaves the param out. */
export function withBackgroundParam(search: string, id: BackgroundId): string {
  const params = new URLSearchParams(search)
  if (id === DEFAULT_BACKGROUND) {
    params.delete(BACKGROUND_PARAM)
  } else {
    params.set(BACKGROUND_PARAM, id)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export function isBackgroundLabEnabled(env: LabEnv): boolean {
  return env.DEV || env.VITE_BG_LAB === '1'
}

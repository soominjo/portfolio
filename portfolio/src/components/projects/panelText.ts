import type { Project, ProjectType } from '../../../../shared/types/project'

export const TYPE_LABELS: Readonly<Record<ProjectType, string>> = {
  professional: 'Professional',
  personal: 'Personal',
}

// Longest titles, in characters, that still get the larger type sizes.
const LARGE_TITLE_MAX = 12
const MEDIUM_TITLE_MAX = 18

/** "Professional · Full-Stack Developer" */
export function metaLine(project: Pick<Project, 'type' | 'role'>): string {
  return `${TYPE_LABELS[project.type]} · ${project.role}`
}

/** Two-digit project number: 1 → "01". */
export function formatIndex(value: number): string {
  return String(value).padStart(2, '0')
}

/** Short screens get the compact type and spacing. */
export type PanelDensity = 'regular' | 'compact'

// Large, medium and small title scales per density, indexed by title length.
const TITLE_SIZES: Readonly<Record<PanelDensity, readonly [string, string, string]>> = {
  regular: ['text-5xl sm:text-6xl xl:text-7xl', 'text-4xl sm:text-5xl xl:text-6xl', 'text-3xl sm:text-4xl xl:text-5xl'],
  compact: ['text-4xl sm:text-5xl', 'text-3xl sm:text-4xl', 'text-2xl sm:text-3xl'],
}

/** Type scale for a project title, so long names still fit the panel. */
export function titleSizeClass(title: string, density: PanelDensity = 'regular'): string {
  const [large, medium, small] = TITLE_SIZES[density]
  if (title.length <= LARGE_TITLE_MAX) return large
  if (title.length <= MEDIUM_TITLE_MAX) return medium
  return small
}

interface PanelSpacing {
  readonly index: string
  readonly meta: string
  readonly title: string
  readonly tagline: string
  readonly stack: string
  readonly button: string
}

export const PANEL_SPACING: Readonly<Record<PanelDensity, PanelSpacing>> = {
  regular: { index: 'mb-4 sm:mb-5', meta: 'mb-3', title: 'mb-4', tagline: 'mb-6 text-base sm:text-lg', stack: 'mb-7', button: 'py-3' },
  compact: { index: 'mb-2', meta: 'mb-1.5', title: 'mb-2', tagline: 'mb-3 text-sm', stack: 'mb-4', button: 'py-2.5' },
}

import type { SkillGroup } from '../../../../shared/data/skills'
import { readableOn } from '../../lib/brandColor'
import { getTechIcon } from '../../lib/techIcons'

/**
 * Tile fill and text colour per theme. The tile is the About section colour
 * (#070b14) under a 3% white wash in the dark theme, and slate-50 in the light.
 * Brand colours are checked against these so every logo reads at 3:1 or better.
 */
export const TILE_COLORS = {
  dark: { tile: '#0e121b', foreground: '#e2e8f0' },
  light: { tile: '#f8fafc', foreground: '#1e293b' },
} as const

/** Cyan accent (docs/DESIGN.md) for skills that have no logo of their own. */
export const ACCENT_COLORS = { dark: '#22d3ee', light: '#0891b2' } as const

export interface SkillMark {
  /** SVG path data for a 0 0 24 24 viewBox. */
  readonly path: string
  /** Logo colour on the dark theme's tile. */
  readonly dark: string
  /** Logo colour on the light theme's tile. */
  readonly light: string
}

export interface SkillItem {
  readonly name: string
  /** The brand logo, or null for skills shown as text (no logo exists). */
  readonly mark: SkillMark | null
}

export interface SkillRowData {
  readonly category: string
  readonly glyph: string
  readonly items: readonly SkillItem[]
}

function toItem(name: string): SkillItem {
  const icon = getTechIcon(name)
  if (!icon) return { name, mark: null }

  return {
    name,
    mark: {
      path: icon.path,
      dark: readableOn(icon.hex, TILE_COLORS.dark.tile, TILE_COLORS.dark.foreground),
      light: readableOn(icon.hex, TILE_COLORS.light.tile, TILE_COLORS.light.foreground),
    },
  }
}

/**
 * One display row per skill group. Skills with a logo come first and the
 * text-only ones after them, as in a row of app icons followed by tags.
 */
export function buildSkillRows(groups: readonly SkillGroup[]): SkillRowData[] {
  return groups.map((group) => {
    const items = group.skills.map(toItem)
    return {
      category: group.category,
      glyph: group.icon,
      items: [...items.filter((item) => item.mark), ...items.filter((item) => !item.mark)],
    }
  })
}

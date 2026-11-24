import type { CSSProperties } from 'react'

/** A skill's colour on each theme's tile. */
export interface MarkColors {
  readonly dark: string
  readonly light: string
}

/** Inline custom properties that carry a skill's colour for both themes. */
export function markColorVars(colors: MarkColors): CSSProperties {
  return { '--mark-dark': colors.dark, '--mark-light': colors.light } as CSSProperties
}

/** Points `--mark` at the colour for the current theme. Pair with markColorVars(). */
export const MARK_THEME_CLASS = '[--mark:var(--mark-dark)] light:[--mark:var(--mark-light)]'

/** An active text pill: --mark tints its border and fill, and the text brightens. */
export const MARK_ACTIVE_PILL_CLASS =
  'border-[color-mix(in_oklab,var(--mark)_60%,transparent)] bg-[color-mix(in_oklab,var(--mark)_10%,transparent)] text-white light:text-slate-900'

/** An active logo tile: the logo's own colour (--mark) tints its border, fill and glow. */
export const MARK_ACTIVE_TILE_CLASS =
  'border-[color-mix(in_oklab,var(--mark)_60%,transparent)] bg-[color-mix(in_oklab,var(--mark)_12%,transparent)] shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--mark)_80%,transparent)] light:shadow-[0_12px_24px_-14px_color-mix(in_oklab,var(--mark)_70%,transparent)]'

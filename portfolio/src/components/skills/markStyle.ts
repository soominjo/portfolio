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

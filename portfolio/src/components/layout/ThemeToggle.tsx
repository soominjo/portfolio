// Icon adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { useId, type MouseEvent } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { ICON_BUTTON_CLASS } from './navConfig'

interface ThemeToggleProps {
  theme: Theme
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void
  className?: string
}

const RAYS =
  'M19 3v7M19 35v-7M32.856 11l-6.062 3.5M5.144 27l6.062-3.5M5.144 11l6.062 3.5M32.856 27l-6.062-3.5'

/**
 * Shows a sun in the light theme and a moon in the dark one, morphing
 * between them (the transitions live in index.css under .theme-icon).
 */
export function ThemeToggle({ theme, onToggle, className = ICON_BUTTON_CLASS }: ThemeToggleProps) {
  // Two toggles render at once (desktop corner + phone bar), so each needs its own mask id.
  const maskId = `theme-toggle-mask-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={className}
    >
      <svg aria-hidden="true" width="38" height="38" viewBox="0 0 38 38">
        <defs>
          <mask id={maskId}>
            <circle className="theme-icon__circle" fill="white" cx="19" cy="19" r="13" />
            <circle className="theme-icon__mask" fill="black" cx="25" cy="14" r="9" />
          </mask>
        </defs>
        <path className="theme-icon__rays" d={RAYS} />
        <circle
          className="theme-icon__circle"
          fill="currentColor"
          mask={`url(#${maskId})`}
          cx="19"
          cy="19"
          r="12"
        />
      </svg>
    </button>
  )
}

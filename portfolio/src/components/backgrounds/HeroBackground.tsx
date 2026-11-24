import { Suspense } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { DecorativeBoundary } from '../DecorativeBoundary'
import { isBackgroundLabEnabled } from './backgroundLab'
import { BackgroundSwitcher } from './BackgroundSwitcher'
import { LabBackground } from './labBackgrounds'
import { useBackgroundChoice } from './useBackgroundChoice'

const LAB_ENABLED = isBackgroundLabEnabled(import.meta.env)

interface HeroBackgroundProps {
  theme: Theme
  labEnabled?: boolean
}

/**
 * The hero's WebGL layer. Production always shows the galaxy.
 * In the lab (dev, or a VITE_BG_LAB=1 preview) a picker swaps in the other
 * candidates. Each one is decorative, so a failure only removes it, and the
 * boundary resets when you switch.
 */
export function HeroBackground({ theme, labEnabled = LAB_ENABLED }: HeroBackgroundProps) {
  const [choice, choose] = useBackgroundChoice(labEnabled)

  return (
    <>
      <DecorativeBoundary key={choice}>
        <Suspense fallback={null}>
          <LabBackground id={choice} theme={theme} className="pointer-events-none absolute inset-0" />
        </Suspense>
      </DecorativeBoundary>
      {labEnabled && <BackgroundSwitcher value={choice} onChange={choose} />}
    </>
  )
}

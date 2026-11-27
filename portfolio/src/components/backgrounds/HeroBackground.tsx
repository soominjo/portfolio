import { lazy, Suspense } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { DecorativeBoundary } from '../DecorativeBoundary'

// WebGL code is heavy, so the particles are their own chunk that loads after first paint.
const Particles = lazy(() => import('./react-bits/Particles'))

// Indigo light, cyan and indigo, from docs/DESIGN.md.
const PARTICLE_COLORS = ['#818cf8', '#22d3ee', '#6366f1']

interface HeroBackgroundProps {
  theme: Theme
}

/**
 * The hero's WebGL layer: React Bits particles in the site palette. It is
 * decorative, so a failure only removes it.
 */
export function HeroBackground({ theme }: HeroBackgroundProps) {
  return (
    <DecorativeBoundary>
      <Suspense fallback={null}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <Particles particleColors={PARTICLE_COLORS} connections lightMode={theme === 'light'} />
        </div>
      </Suspense>
    </DecorativeBoundary>
  )
}

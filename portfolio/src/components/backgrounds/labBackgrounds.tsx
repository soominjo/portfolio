import { lazy, type ReactNode } from 'react'
import type { Theme } from '../../hooks/useTheme'
import type { BackgroundId } from './backgroundLab'

// WebGL code is heavy, so each background is its own chunk that loads after
// first paint, and the lab only downloads the one you pick.
const DisplacementSphere = lazy(() => import('../three/DisplacementSphere'))
const Orb = lazy(() => import('./react-bits/Orb'))
const Galaxy = lazy(() => import('./react-bits/Galaxy'))
const Particles = lazy(() => import('./react-bits/Particles'))
const Topography = lazy(() => import('./react-bits/Topography'))
const GridScan = lazy(() => import('./react-bits/GridScan'))

// Colours from docs/DESIGN.md.
const PALETTE = {
  base: '#05070f',
  indigo: '#6366f1',
  indigoLight: '#818cf8',
  indigoDeep: '#1e1b4b',
  indigoGrid: '#4338ca',
  cyan: '#22d3ee',
} as const

// The orb has no light mode, so, like the sphere, it steps back on the light page.
const ORB_OPACITY: Record<Theme, number> = { dark: 1, light: 0.35 }

type CandidateId = Exclude<BackgroundId, 'sphere'>

const CANDIDATES: Record<CandidateId, (lightMode: boolean) => ReactNode> = {
  // Shifted right on wide screens, where the sphere sits.
  orb: () => (
    <div className="absolute inset-0 lg:left-[40%]">
      <Orb colors={[PALETTE.indigo, PALETTE.cyan, PALETTE.indigoDeep]} backgroundColor={PALETTE.base} />
    </div>
  ),
  galaxy: (lightMode) => (
    <Galaxy starColors={[PALETTE.indigoLight, PALETTE.cyan, PALETTE.indigo]} lightMode={lightMode} />
  ),
  particles: (lightMode) => (
    <Particles
      particleColors={[PALETTE.indigoLight, PALETTE.cyan, PALETTE.indigo]}
      connections
      lightMode={lightMode}
    />
  ),
  topography: (lightMode) => <Topography color={PALETTE.indigo} lightMode={lightMode} />,
  // Webcam head tracking and device tilt stay off: no camera prompt, no CDN script.
  'grid-scan': (lightMode) => (
    <GridScan
      linesColor={PALETTE.indigoGrid}
      scanColor={PALETTE.cyan}
      enableWebcam={false}
      enableGyro={false}
      lightMode={lightMode}
    />
  ),
}

interface LabBackgroundProps {
  id: BackgroundId
  theme: Theme
  className?: string
}

/** One hero background, drawn in the site palette. */
export function LabBackground({ id, theme, className }: LabBackgroundProps) {
  if (id === 'sphere') return <DisplacementSphere theme={theme} className={className} />

  return (
    <div
      aria-hidden="true"
      className={className}
      style={id === 'orb' ? { opacity: ORB_OPACITY[theme] } : undefined}
    >
      {CANDIDATES[id](theme === 'light')}
    </div>
  )
}

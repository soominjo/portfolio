import type { CSSProperties } from 'react'

// Centred on the devices: (50%, 26%) when stacked, (70%, 50%) beside the text.
const CENTRE = 'var(--rings-x) var(--rings-y)'
const RINGS_MASK = `radial-gradient(circle at ${CENTRE}, #000 15%, transparent 65%)`

function rings(color: string): CSSProperties {
  return {
    backgroundImage: `repeating-radial-gradient(circle at ${CENTRE}, ${color} 0 1px, transparent 1.5px 46px)`,
    maskImage: RINGS_MASK,
    WebkitMaskImage: RINGS_MASK,
  }
}

function glow(indigo: string, cyan: string): CSSProperties {
  return {
    backgroundImage: [
      `radial-gradient(ellipse 45% 50% at ${CENTRE}, ${indigo}, transparent 70%)`,
      `radial-gradient(ellipse 30% 35% at 85% 85%, ${cyan}, transparent 70%)`,
    ].join(', '),
  }
}

/** Concentric rings and a soft indigo glow behind the devices, in both themes. */
export function StageBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 [--rings-x:50%] [--rings-y:26%] lg:[--rings-x:70%] lg:[--rings-y:50%]"
    >
      <div className="absolute inset-0 light:hidden" style={glow('rgba(99,102,241,0.18)', 'rgba(34,211,238,0.06)')} />
      <div className="absolute inset-0 light:hidden" style={rings('rgba(129,140,248,0.14)')} />
      <div className="absolute inset-0 hidden light:block" style={glow('rgba(99,102,241,0.10)', 'rgba(34,211,238,0.06)')} />
      <div className="absolute inset-0 hidden light:block" style={rings('rgba(79,70,229,0.10)')} />
    </div>
  )
}

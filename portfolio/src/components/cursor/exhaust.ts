import type { Theme } from '../../hooks/useTheme'

// The rocket cursor's exhaust as plain particle maths, with no DOM.
// exhaustEngine.ts feeds it pointer moves and draws the result.

export interface Point {
  readonly x: number
  readonly y: number
}

export interface Particle {
  readonly x: number
  readonly y: number
  /** Velocity in px per second. */
  readonly vx: number
  readonly vy: number
  /** Seconds since it left the nozzle, and how many it lasts. */
  readonly age: number
  readonly life: number
  /** Starting radius in px. */
  readonly size: number
}

export interface Trail {
  readonly particles: readonly Particle[]
  /** Distance flown since the last particle, carried into the next move. */
  readonly carry: number
}

export interface ParticleLook {
  readonly color: string
  readonly alpha: number
  readonly radius: number
}

/** A number in [0, 1), like Math.random. Tests pass a fixed one. */
export type Random = () => number

interface ColorStop {
  readonly until: number
  readonly color: string
}

/** The 32px cursor art (assets/cursors/rocket.svg) points up-left, and its nose tip is the click point. */
export const ROCKET_HOTSPOT: Point = { x: 6, y: 6 }
const ROCKET_NOZZLE: Point = { x: 22, y: 22 }

/** From the pointer position (the nose) to the nozzle. */
export const NOZZLE_OFFSET: Point = {
  x: ROCKET_NOZZLE.x - ROCKET_HOTSPOT.x,
  y: ROCKET_NOZZLE.y - ROCKET_HOTSPOT.y,
}

/** A move longer than this is the pointer coming back into the window, not flight. */
export const MAX_STEP = 240

/** The most particles alive at once, so a frantic mouse can't pile up work. */
export const MAX_PARTICLES = 180

// The exhaust leaves along the body, down and to the right, in a 0.8 rad cone.
const EXHAUST_ANGLE = Math.PI / 4
const SPREAD = 0.8
const BASE_SPEED = 50
const EXTRA_SPEED = 60
const BASE_LIFE = 0.38
const EXTRA_LIFE = 0.3
const BASE_SIZE = 2
const EXTRA_SIZE = 2.4
const JITTER = 2
const DRAG = 3
const BURST_POWER = 2.6

// Hot to cold. The light page gets deeper tones, since additive glow would vanish on it.
const DARK_RAMP: readonly ColorStop[] = [
  { until: 0.18, color: '#ecfeff' },
  { until: 0.45, color: '#22d3ee' },
  { until: 0.75, color: '#6366f1' },
  { until: Infinity, color: '#3730a3' },
]
const LIGHT_RAMP: readonly ColorStop[] = [
  { until: 0.35, color: '#0891b2' },
  { until: 0.7, color: '#4f46e5' },
  { until: Infinity, color: '#312e81' },
]

/** One puff of exhaust from the nozzle of a rocket whose nose is at `nose`. More power flies faster and lasts longer. */
export function emitParticle(nose: Point, power: number, random: Random): Particle {
  const angle = EXHAUST_ANGLE + (random() - 0.5) * SPREAD
  const speed = BASE_SPEED + random() * EXTRA_SPEED * power
  return {
    x: nose.x + NOZZLE_OFFSET.x + (random() - 0.5) * JITTER,
    y: nose.y + NOZZLE_OFFSET.y + (random() - 0.5) * JITTER,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    age: 0,
    life: BASE_LIFE + random() * EXTRA_LIFE * power,
    size: BASE_SIZE + random() * EXTRA_SIZE,
  }
}

/** The exhaust left along one pointer move: a puff every `spacing` px, carrying the leftover distance. */
export function emitAlong(
  from: Point,
  to: Point,
  carry: number,
  spacing: number,
  power: number,
  random: Random,
): Trail {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)
  if (distance > MAX_STEP) return { particles: [], carry: 0 }

  const flown = carry + distance
  const count = Math.floor(flown / spacing)
  const particles = Array.from({ length: count }, () => {
    const along = random()
    return emitParticle({ x: from.x + dx * along, y: from.y + dy * along }, power, random)
  })
  return { particles, carry: flown - count * spacing }
}

/** The boost fired on a click: `count` fast puffs at once. */
export function burst(nose: Point, count: number, random: Random): Particle[] {
  return Array.from({ length: count }, () => emitParticle(nose, BURST_POWER, random))
}

/** Every particle `dt` seconds later: moved, slowed by drag, and gone once its life is spent. */
export function advance(particles: readonly Particle[], dt: number): Particle[] {
  const drag = Math.exp(-dt * DRAG)
  return particles
    .filter((particle) => particle.age + dt < particle.life)
    .map((particle) => ({
      ...particle,
      x: particle.x + particle.vx * dt,
      y: particle.y + particle.vy * dt,
      vx: particle.vx * drag,
      vy: particle.vy * drag,
      age: particle.age + dt,
    }))
}

/** Keeps the newest `max` particles. */
export function capParticles(particles: readonly Particle[], max: number = MAX_PARTICLES): readonly Particle[] {
  return particles.length > max ? particles.slice(particles.length - max) : particles
}

/** The colour of exhaust `progress` of the way through its life (0 to 1). */
export function exhaustColor(progress: number, theme: Theme): string {
  const ramp = theme === 'light' ? LIGHT_RAMP : DARK_RAMP
  return (ramp.find((stop) => progress < stop.until) ?? ramp[ramp.length - 1]).color
}

/** How to draw a particle now: it cools, fades and shrinks as it ages. */
export function particleLook(particle: Particle, theme: Theme): ParticleLook {
  const progress = particle.age / particle.life
  return {
    color: exhaustColor(progress, theme),
    alpha: (1 - progress) * (theme === 'light' ? 0.75 : 0.9),
    radius: particle.size * (1 - progress * 0.55),
  }
}

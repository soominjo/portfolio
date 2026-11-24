import { describe, expect, it } from 'vitest'
import {
  advance,
  burst,
  capParticles,
  emitAlong,
  emitParticle,
  exhaustColor,
  MAX_STEP,
  NOZZLE_OFFSET,
  particleLook,
  ROCKET_HOTSPOT,
  type Particle,
} from './exhaust'

// 0.5 means no jitter and no spread: every particle leaves straight along the body.
const middle = () => 0.5
const origin = { x: 0, y: 0 }
const speed = (p: Particle) => Math.hypot(p.vx, p.vy)

describe('rocket geometry', () => {
  it('measures the nozzle from the nose, which is the click point', () => {
    expect(ROCKET_HOTSPOT).toEqual({ x: 6, y: 6 })
    expect(NOZZLE_OFFSET).toEqual({ x: 16, y: 16 })
  })
})

describe('emitParticle', () => {
  it('starts at the nozzle, down and right of the nose', () => {
    const p = emitParticle({ x: 100, y: 50 }, 1, middle)
    expect(p.x).toBe(100 + NOZZLE_OFFSET.x)
    expect(p.y).toBe(50 + NOZZLE_OFFSET.y)
    expect(p.age).toBe(0)
  })

  it('flies out along the rocket body, away from the nose', () => {
    const p = emitParticle(origin, 1, middle)
    expect(p.vx).toBeGreaterThan(0)
    expect(p.vy).toBeCloseTo(p.vx, 6)
  })

  it('flies faster and lasts longer with more power', () => {
    const calm = emitParticle(origin, 1, middle)
    const boost = emitParticle(origin, 2.6, middle)
    expect(speed(boost)).toBeGreaterThan(speed(calm))
    expect(boost.life).toBeGreaterThan(calm.life)
  })
})

describe('emitAlong', () => {
  it('drops one particle per spacing and carries the rest over', () => {
    const trail = emitAlong(origin, { x: 10, y: 0 }, 0, 4, 1, middle)
    expect(trail.particles).toHaveLength(2)
    expect(trail.carry).toBeCloseTo(2)
  })

  it('adds the distance carried from the previous move', () => {
    const trail = emitAlong(origin, { x: 2, y: 0 }, 2, 4, 1, middle)
    expect(trail.particles).toHaveLength(1)
    expect(trail.carry).toBeCloseTo(0)
  })

  it('places the particles on the path that was flown', () => {
    const trail = emitAlong(origin, { x: 40, y: 0 }, 0, 4, 1, middle)
    expect(trail.particles.length).toBeGreaterThan(0)
    for (const p of trail.particles) {
      expect(p.x - NOZZLE_OFFSET.x).toBe(20)
      expect(p.y - NOZZLE_OFFSET.y).toBe(0)
    }
  })

  it('treats a long jump as the pointer coming back, not as flight', () => {
    expect(emitAlong(origin, { x: MAX_STEP + 1, y: 0 }, 3, 4, 1, middle)).toEqual({ particles: [], carry: 0 })
  })
})

describe('burst', () => {
  it('fires the given number of particles, faster than normal flight', () => {
    const sparks = burst({ x: 10, y: 10 }, 24, middle)
    const normal = emitParticle({ x: 10, y: 10 }, 1, middle)
    expect(sparks).toHaveLength(24)
    for (const spark of sparks) expect(speed(spark)).toBeGreaterThan(speed(normal))
  })
})

describe('advance', () => {
  const particle: Particle = { x: 0, y: 0, vx: 100, vy: 50, age: 0, life: 0.5, size: 3 }

  it('moves and ages each particle and slows it down', () => {
    const [next] = advance([particle], 0.1)
    expect(next.x).toBeCloseTo(10)
    expect(next.y).toBeCloseTo(5)
    expect(next.age).toBeCloseTo(0.1)
    expect(next.vx).toBeLessThan(100)
  })

  it('drops particles that have burned out', () => {
    expect(advance([{ ...particle, age: 0.45 }], 0.1)).toEqual([])
  })

  it('leaves its input untouched', () => {
    const input = Object.freeze([Object.freeze({ ...particle })])
    advance(input, 0.1)
    expect(input[0]).toEqual(particle)
  })
})

describe('capParticles', () => {
  const many = Array.from({ length: 5 }, (_, x): Particle => ({ x, y: 0, vx: 0, vy: 0, age: 0, life: 1, size: 1 }))

  it('keeps only the newest particles', () => {
    expect(capParticles(many, 3).map((p) => p.x)).toEqual([2, 3, 4])
  })

  it('leaves a short list as it is', () => {
    expect(capParticles(many, 10)).toBe(many)
  })
})

describe('exhaustColor', () => {
  it('cools from white-hot through cyan to indigo on the dark page', () => {
    expect(exhaustColor(0, 'dark')).toBe('#ecfeff')
    expect(exhaustColor(0.3, 'dark')).toBe('#22d3ee')
    expect(exhaustColor(0.6, 'dark')).toBe('#6366f1')
    expect(exhaustColor(0.9, 'dark')).toBe('#3730a3')
  })

  it('uses deeper colours that read on the light page', () => {
    expect(exhaustColor(0, 'light')).toBe('#0891b2')
    expect(exhaustColor(0.5, 'light')).toBe('#4f46e5')
    expect(exhaustColor(0.9, 'light')).toBe('#312e81')
  })
})

describe('particleLook', () => {
  const particle: Particle = { x: 0, y: 0, vx: 0, vy: 0, age: 0, life: 0.5, size: 3 }

  it('fades and shrinks a particle as it ages', () => {
    const young = particleLook(particle, 'dark')
    const old = particleLook({ ...particle, age: 0.4 }, 'dark')
    expect(old.alpha).toBeLessThan(young.alpha)
    expect(old.radius).toBeLessThan(young.radius)
    expect(young.color).toBe(exhaustColor(0, 'dark'))
  })

  it('is a little softer on the light page', () => {
    expect(particleLook(particle, 'light').alpha).toBeLessThan(particleLook(particle, 'dark').alpha)
  })
})

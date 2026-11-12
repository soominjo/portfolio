import { describe, expect, it } from 'vitest'
import { easeInOutCubic, isSettled, stepSpring, type SpringState } from './motionMath'

const SPRING = { stiffness: 80, damping: 20, mass: 1 }

describe('stepSpring', () => {
  it('settles on its target', () => {
    let state: SpringState = { value: 0, velocity: 0 }
    for (let frame = 0; frame < 300; frame++) state = stepSpring(state, 1, SPRING, 1 / 60)
    expect(Math.abs(state.value - 1)).toBeLessThan(1e-3)
    expect(isSettled(state, 1)).toBe(true)
  })

  it('moves toward the target on the first frame', () => {
    const state = stepSpring({ value: 0, velocity: 0 }, 1, SPRING, 1 / 60)
    expect(state.value).toBeGreaterThan(0)
    expect(state.velocity).toBeGreaterThan(0)
  })

  it('stays stable on a very long frame', () => {
    const state = stepSpring({ value: 0, velocity: 0 }, 1, SPRING, 5)
    expect(Number.isFinite(state.value)).toBe(true)
    expect(Math.abs(state.value)).toBeLessThanOrEqual(2)
  })

  it('returns a new state and leaves the old one alone', () => {
    const start = Object.freeze({ value: 0, velocity: 0 })
    const next = stepSpring(start, 1, SPRING, 1 / 60)
    expect(next).not.toBe(start)
    expect(start).toEqual({ value: 0, velocity: 0 })
  })
})

describe('isSettled', () => {
  it('is false while away from the target or still moving', () => {
    expect(isSettled({ value: 0.5, velocity: 0 }, 1)).toBe(false)
    expect(isSettled({ value: 1, velocity: 0.5 }, 1)).toBe(false)
  })
})

describe('easeInOutCubic', () => {
  it.each([
    [0, 0],
    [0.25, 0.0625],
    [0.5, 0.5],
    [1, 1],
    [-1, 0],
    [2, 1],
  ])('maps %s to %s', (t, eased) => {
    expect(easeInOutCubic(t)).toBeCloseTo(eased)
  })
})

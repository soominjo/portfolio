import { describe, expect, it } from 'vitest'
import { clamp01, easeOut, loopAt, seededRandom, wave, wrap } from './sceneMath'

describe('sceneMath', () => {
  it('clamps to 0..1', () => {
    expect(clamp01(-2)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(3)).toBe(1)
  })

  it('eases out from 0 to 1, quickly at first', () => {
    expect(easeOut(0)).toBe(0)
    expect(easeOut(1)).toBe(1)
    expect(easeOut(0.5)).toBeGreaterThan(0.5)
    expect(easeOut(2)).toBe(1)
  })

  it('waves between 0 and 1', () => {
    expect(wave(Math.PI / 2)).toBeCloseTo(1)
    expect(wave(-Math.PI / 2)).toBeCloseTo(0)
  })

  it('repeats the same random sequence for the same seed', () => {
    const a = seededRandom(7)
    const b = seededRandom(7)
    const first = [a(), a(), a()]
    expect([b(), b(), b()]).toEqual(first)
    expect(first.every((value) => value >= 0 && value < 1)).toBe(true)
    expect(seededRandom(8)()).not.toBe(first[0])
  })

  it('wraps negative values into range', () => {
    expect(wrap(-1, 10)).toBe(9)
    expect(wrap(23, 10)).toBe(3)
  })

  describe('loopAt', () => {
    const timing = { period: 10, build: 4, hold: 3 }

    it('builds, holds, then fades out', () => {
      expect(loopAt(2, true, timing)).toEqual({ progress: 0.5, fade: 1, local: 2 })
      expect(loopAt(6, true, timing).progress).toBe(1)
      expect(loopAt(6, true, timing).fade).toBe(1)
      expect(loopAt(8.5, true, timing).fade).toBeCloseTo(0.5)
      expect(loopAt(11, true, timing).local).toBeCloseTo(1)
    })

    it('shifts by the offset', () => {
      expect(loopAt(0, true, { ...timing, offset: 2 }).local).toBe(2)
    })

    it('shows the finished picture without motion', () => {
      const still = loopAt(123, false, timing)
      expect(still.progress).toBe(1)
      expect(still.fade).toBe(1)
    })
  })
})

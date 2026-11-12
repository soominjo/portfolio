import { describe, expect, it } from 'vitest'
import { coverTransform } from './screenFit'

const IDENTITY = { repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 }

describe('coverTransform', () => {
  it('keeps an image that already fits', () => {
    expect(coverTransform(1.6, 1.6)).toEqual(IDENTITY)
  })

  it('crops the sides of a wider image evenly', () => {
    const fit = coverTransform(2, 1.6)
    expect(fit.repeatX).toBeCloseTo(0.8)
    expect(fit.offsetX).toBeCloseTo(0.1)
    expect(fit.repeatY).toBe(1)
    expect(fit.offsetY).toBe(0)
  })

  it('keeps the left edge of a wider image when focused left', () => {
    const fit = coverTransform(2, 1.6, 0)
    expect(fit.repeatX).toBeCloseTo(0.8)
    expect(fit.offsetX).toBe(0)
  })

  it('keeps the right edge of a wider image when focused right', () => {
    expect(coverTransform(2, 1.6, 1).offsetX).toBeCloseTo(0.2)
  })

  it('crops the bottom of a taller image and keeps its top', () => {
    const fit = coverTransform(0.4, 0.5)
    expect(fit.repeatY).toBeCloseTo(0.8)
    expect(fit.offsetY).toBeCloseTo(0.2)
    expect(fit.repeatX).toBe(1)
    expect(fit.offsetX).toBe(0)
  })

  it.each([
    [0, 1.6],
    [Number.NaN, 1],
    [1.6, -1],
    [Number.POSITIVE_INFINITY, 1],
  ])('ignores the invalid aspects %s and %s', (image, screen) => {
    expect(coverTransform(image, screen)).toEqual(IDENTITY)
  })
})

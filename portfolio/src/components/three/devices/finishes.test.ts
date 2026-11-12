import { describe, expect, it } from 'vitest'
import { FINISHES } from './finishes'

// WCAG relative luminance, written out here so the test doesn't trust the code.
function luminance(hex: string): number {
  const channel = (offset: number) => {
    const c = parseInt(hex.slice(offset, offset + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)
}

describe('FINISHES', () => {
  it('defines every finish with valid colours and material ranges', () => {
    for (const spec of Object.values(FINISHES)) {
      expect(spec.body).toMatch(/^#[0-9a-f]{6}$/i)
      expect(spec.keys).toMatch(/^#[0-9a-f]{6}$/i)
      for (const amount of [spec.metalness, spec.roughness]) {
        expect(amount).toBeGreaterThanOrEqual(0)
        expect(amount).toBeLessThanOrEqual(1)
      }
    }
  })

  it('gives every finish keys that stand out from its body', () => {
    for (const spec of Object.values(FINISHES)) {
      const [lighter, darker] = [luminance(spec.body), luminance(spec.keys)].sort((a, b) => b - a)
      // A subtle floor: lighting adds more separation on top of the flat colours.
      expect((lighter + 0.05) / (darker + 0.05)).toBeGreaterThan(1.3)
    }
  })

  it('orders the bodies from dark to light: black, silver, white', () => {
    expect(luminance(FINISHES.black.body)).toBeLessThan(luminance(FINISHES.silver.body))
    expect(luminance(FINISHES.silver.body)).toBeLessThan(luminance(FINISHES.white.body))
  })
})

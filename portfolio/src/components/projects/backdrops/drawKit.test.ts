import { describe, expect, it } from 'vitest'
import { dot, dotGrid, ellipseGlow, gridLines, label, rgba, roundedRect } from './drawKit'
import { fakeContext } from './fakeContext'

const VIEW = { left: 0, top: 0, right: 100, bottom: 50 }

describe('drawKit', () => {
  it('formats colours and clamps the alpha', () => {
    expect(rgba([1, 2, 3], 0.5)).toBe('rgba(1,2,3,0.5)')
    expect(rgba([1, 2, 3], 4)).toBe('rgba(1,2,3,1)')
    expect(rgba([1, 2, 3], -1)).toBe('rgba(1,2,3,0)')
  })

  it('draws a dot, with a halo only when asked', () => {
    const plain = fakeContext()
    dot(plain.ctx, 0, 0, 2, [0, 0, 0], 1)
    expect(plain.count('fill')).toBe(1)
    expect(plain.count('createRadialGradient')).toBe(0)

    const haloed = fakeContext()
    dot(haloed.ctx, 0, 0, 2, [0, 0, 0], 1, 8)
    expect(haloed.count('fill')).toBe(2)
    expect(haloed.count('createRadialGradient')).toBe(1)
  })

  it('keeps label text at least 7 CSS pixels and resets the text state', () => {
    const { ctx, texts } = fakeContext()
    label(ctx, 'RUN 0.98', 10, 10, { rgb: [255, 255, 255], alpha: 0.8, size: 10, px: 2 })
    expect(texts).toEqual(['RUN 0.98'])
    expect(ctx.font).toContain('14px')
    expect(ctx.textAlign).toBe('start')
    expect(ctx.letterSpacing).toBe('0px')
  })

  it('uses the requested size when it is already legible', () => {
    const { ctx } = fakeContext()
    label(ctx, 'TRANCHE 1', 0, 0, { rgb: [0, 0, 0], alpha: 1, size: 12, align: 'center', px: 1 })
    expect(ctx.font).toContain('12px')
  })

  it('wraps an elliptical glow in save and restore', () => {
    const fake = fakeContext()
    ellipseGlow(fake.ctx, 10, 10, 50, 20, [1, 1, 1], 0.2)
    expect(fake.calls).toEqual(['save', 'translate', 'scale', 'createRadialGradient', 'fillRect', 'restore'])
  })

  it('draws grid lines and dots across the view', () => {
    const lines = fakeContext()
    gridLines(lines.ctx, VIEW, 25, [1, 1, 1], 0.2, 1)
    expect(lines.count('moveTo')).toBe(4 + 2)
    expect(lines.count('stroke')).toBe(1)

    const dots = fakeContext()
    dotGrid(dots.ctx, VIEW, 25, 2, [1, 1, 1], 0.2)
    expect(dots.count('fillRect')).toBe(4 * 2)
  })

  it('falls back to a plain rectangle without roundRect', () => {
    const fake = fakeContext()
    Object.defineProperty(fake.ctx, 'roundRect', { value: undefined })
    roundedRect(fake.ctx, 0, 0, 10, 10, 3)
    expect(fake.count('rect')).toBe(1)

    const rounded = fakeContext()
    roundedRect(rounded.ctx, 0, 0, 10, 10, 3)
    expect(rounded.count('roundRect')).toBe(1)
  })
})

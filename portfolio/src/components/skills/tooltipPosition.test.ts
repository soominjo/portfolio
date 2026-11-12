import { describe, expect, it } from 'vitest'
import { edgeShift } from './tooltipPosition'

const base = { halfWidth: 40, viewportWidth: 400, margin: 8 }

describe('edgeShift', () => {
  it('leaves a tooltip that fits where it is', () => {
    expect(edgeShift({ ...base, center: 200 })).toBe(0)
  })

  it('nudges right to clear the left edge', () => {
    // Left edge would sit at -20; it needs to sit at the 8px margin.
    expect(edgeShift({ ...base, center: 20 })).toBe(28)
  })

  it('nudges left to clear the right edge', () => {
    // Right edge would sit at 430; the limit is 392.
    expect(edgeShift({ ...base, center: 390 })).toBe(-38)
  })

  it('keeps the start readable when the tooltip is wider than the screen', () => {
    expect(edgeShift({ ...base, center: 100, halfWidth: 300 })).toBe(208)
  })
})

import { describe, expect, it } from 'vitest'
import { COMPOSITION, MARGIN } from '../../three/devices/framing'
import { computeLayout, deviceWidthIn, sameLayout, sceneTransform, VIRTUAL } from './backdropLayout'

const DESKTOP_STAGE = { width: 1440, height: 900 }
// Roughly the desktop device cell: the right-hand grid column, 78% tall.
const DESKTOP_CELL = { left: 650, top: 99, width: 718, height: 702 }

describe('deviceWidthIn', () => {
  it('fills the width of a narrow cell, inside the framing margin', () => {
    expect(deviceWidthIn(500, 1000)).toBeCloseTo(500 / MARGIN)
  })

  it('is limited by the height of a wide, short cell', () => {
    const aspect = COMPOSITION.width / COMPOSITION.height
    expect(deviceWidthIn(2000, 300)).toBeCloseTo((300 * aspect) / MARGIN)
  })
})

describe('computeLayout', () => {
  it('is null when the stage or the device cell has no size', () => {
    expect(computeLayout({ width: 0, height: 900 }, DESKTOP_CELL, false)).toBeNull()
    expect(computeLayout(DESKTOP_STAGE, { left: 0, top: 0, width: 0, height: 0 }, false)).toBeNull()
  })

  it('centres the virtual devices on the device cell', () => {
    const layout = computeLayout(DESKTOP_STAGE, DESKTOP_CELL, false)!
    expect(layout.anchorX).toBe(650 + 718 / 2)
    expect(layout.anchorY).toBe(99 + 702 / 2)
    expect(layout.scale).toBeCloseTo(deviceWidthIn(718, 702) / VIRTUAL.deviceWidth)
  })

  it('covers the whole stage with its view', () => {
    const layout = computeLayout(DESKTOP_STAGE, DESKTOP_CELL, false)!
    const [a, , , d, e, f] = sceneTransform(layout, 1)
    expect(a * layout.view.left + e).toBeCloseTo(0)
    expect(d * layout.view.top + f).toBeCloseTo(0)
    expect(a * layout.view.right + e).toBeCloseTo(DESKTOP_STAGE.width)
    expect(d * layout.view.bottom + f).toBeCloseTo(DESKTOP_STAGE.height)
  })

  it('maps the virtual device centre to the anchor, times the pixel ratio', () => {
    const layout = computeLayout(DESKTOP_STAGE, DESKTOP_CELL, false)!
    const [a, , , d, e, f] = sceneTransform(layout, 2)
    expect(a * VIRTUAL.centerX + e).toBeCloseTo(layout.anchorX * 2)
    expect(d * VIRTUAL.centerY + f).toBeCloseTo(layout.anchorY * 2)
  })

  it('fades out like the rings: solid to 15% of the farthest corner, gone by 65%', () => {
    const layout = computeLayout(DESKTOP_STAGE, DESKTOP_CELL, false)!
    const farthest = Math.hypot(layout.anchorX, layout.anchorY)
    expect(layout.maskInner * layout.scale).toBeCloseTo(farthest * 0.15)
    expect(layout.maskOuter * layout.scale).toBeCloseTo(farthest * 0.65)
    expect(layout.fade).toBeNull()
  })

  it('fades out across the bottom of the devices when the layout is stacked', () => {
    const stage = { width: 390, height: 844 }
    const cell = { left: 24, top: 64, width: 342, height: 280 }
    const layout = computeLayout(stage, cell, true)!
    const cellBottom = VIRTUAL.centerY + (cell.top + cell.height - layout.anchorY) / layout.scale
    expect(layout.fade?.from).toBeCloseTo(cellBottom - (844 * 0.06) / layout.scale)
    expect(layout.fade?.to).toBeCloseTo(cellBottom + (844 * 0.04) / layout.scale)
  })

  it('keeps the scale within bounds on huge cells', () => {
    const layout = computeLayout({ width: 5000, height: 3000 }, { left: 0, top: 0, width: 5000, height: 3000 }, false)!
    expect(layout.scale).toBe(1.6)
  })
})

describe('sameLayout', () => {
  it('compares what affects the picture', () => {
    const a = computeLayout(DESKTOP_STAGE, DESKTOP_CELL, false)
    const b = computeLayout(DESKTOP_STAGE, DESKTOP_CELL, false)
    const stacked = computeLayout(DESKTOP_STAGE, DESKTOP_CELL, true)
    const moved = computeLayout(DESKTOP_STAGE, { ...DESKTOP_CELL, left: 600 }, false)
    expect(sameLayout(a, b)).toBe(true)
    expect(sameLayout(a, stacked)).toBe(false)
    expect(sameLayout(a, moved)).toBe(false)
    expect(sameLayout(null, null)).toBe(true)
    expect(sameLayout(a, null)).toBe(false)
  })
})

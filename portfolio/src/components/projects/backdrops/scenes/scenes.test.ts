import { describe, expect, it } from 'vitest'
import type { Theme } from '../../../../hooks/useTheme'
import type { Palette, SceneId } from '../backdropTypes'
import { fakeContext } from '../fakeContext'
import { SCENES } from './index'

const PALETTE: Palette = {
  line: { rgb: [100, 150, 200], alpha: 0.15 },
  glow: { rgb: [10, 20, 30], alpha: 0.2 },
  corner: { rgb: [200, 100, 50], alpha: 0.1 },
  accent: [250, 120, 60],
  accent2: [60, 220, 120],
  accent3: [160, 140, 250],
}
const PLAIN_PALETTE: Palette = { line: PALETTE.line, glow: PALETTE.glow, corner: PALETTE.corner, accent: PALETTE.accent }
const VIEW = { left: 300, top: -40, right: 1700, bottom: 960 }
const TIMES = [0, 2.7, 6.1, 11.4, 15.9]

function frameFor(theme: Theme, motion: boolean, time: number, palette: Palette = PALETTE, reach = 900) {
  const fake = fakeContext()
  return { fake, frame: { ctx: fake.ctx, time, motion, theme, palette, px: 1.2, view: VIEW, reach } }
}

// Each scene must leave the context as it found it, since the painter draws
// the mask and glows straight after it.
function expectCleanState(fake: ReturnType<typeof fakeContext>) {
  const { ctx } = fake
  expect(ctx.globalCompositeOperation).toBe('source-over')
  expect(ctx.globalAlpha).toBe(1)
  expect(ctx.textAlign).toBe('start')
  expect(ctx.lineCap).toBe('butt')
  expect(ctx.lineJoin).toBe('miter')
  expect(ctx.letterSpacing).toBe('0px')
  expect(fake.lineDash()).toEqual([])
}

describe.each(Object.keys(SCENES) as SceneId[])('%s scene', (id) => {
  const scene = SCENES[id]

  it.each<[Theme, boolean]>([
    ['dark', true],
    ['light', true],
    ['dark', false],
  ])('draws in the %s theme (motion %s) and tidies up after itself', (theme, motion) => {
    for (const time of TIMES) {
      const { fake, frame } = frameFor(theme, motion, time)
      scene.drawStatic?.(frame)
      scene.draw(frame)
      expect(fake.count('stroke') + fake.count('fill') + fake.count('fillRect') + fake.count('fillText')).toBeGreaterThan(0)
      expectCleanState(fake)
    }
  })

  it('copes without the optional second and third accents', () => {
    const { fake, frame } = frameFor('dark', true, 4.2, PLAIN_PALETTE)
    scene.drawStatic?.(frame)
    expect(() => scene.draw(frame)).not.toThrow()
    expectCleanState(fake)
  })
})

describe('aurora scene', () => {
  it('draws nothing where the fade hides everything', () => {
    const { fake, frame } = frameFor('dark', true, 3, PALETTE, 0)
    SCENES.aurora.draw(frame)
    expect(fake.count('fill') + fake.count('stroke')).toBe(0)
    expectCleanState(fake)
  })

  it('draws the rays in a handful of strokes, however wide the stage', () => {
    const { fake, frame } = frameFor('dark', true, 3)
    SCENES.aurora.draw({ ...frame, view: { left: -2000, top: -100, right: 4000, bottom: 1000 } })
    // Four ribbons, each with one curtain fill and four ray bands.
    expect(fake.count('stroke')).toBe(16)
    expect(fake.count('fill')).toBe(4)
  })
})

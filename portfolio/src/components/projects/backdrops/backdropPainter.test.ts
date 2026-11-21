import { describe, expect, it } from 'vitest'
import { computeLayout } from './backdropLayout'
import { createBackdropPainter, drawingRatio, STILL_TIME, type PainterOptions } from './backdropPainter'
import type { Palette, ProjectBackdrop, Scene, SceneFrame, SceneId } from './backdropTypes'
import { fakeContext } from './fakeContext'

const LAYOUT = computeLayout({ width: 1440, height: 900 }, { left: 650, top: 99, width: 718, height: 702 }, false)!
const STACKED = computeLayout({ width: 390, height: 844 }, { left: 24, top: 64, width: 342, height: 280 }, true)!
const HUGE = computeLayout({ width: 3840, height: 2160 }, { left: 1900, top: 200, width: 1700, height: 1700 }, false)!

const PALETTE: Palette = {
  line: { rgb: [1, 2, 3], alpha: 0.1 },
  glow: { rgb: [4, 5, 6], alpha: 0.2 },
  corner: { rgb: [7, 8, 9], alpha: 0.1 },
  accent: [10, 11, 12],
}
const backdropOf = (scene: SceneId, palette: Palette = PALETTE): ProjectBackdrop => ({ scene, palettes: { dark: palette, light: palette } })
const SCENE_IDS: SceneId[] = ['pose', 'ledger', 'steam', 'citymap', 'ocr', 'monitor', 'blueprint', 'circuit', 'hexes', 'stars', 'aurora']

function canvasWith(ctx: CanvasRenderingContext2D | null): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  Object.defineProperty(canvas, 'getContext', { value: () => ctx })
  return canvas
}

function setup(sceneOverrides: Partial<Record<SceneId, Scene>> = {}, ratio = 1.5) {
  const main = fakeContext()
  const layer = fakeContext()
  const frames: SceneFrame[] = []
  const stills: SceneFrame[] = []
  const recordingScene: Scene = {
    drawStatic: (frame) => stills.push(frame),
    draw: (frame) => frames.push(frame),
  }
  const scenes = Object.fromEntries(SCENE_IDS.map((id) => [id, sceneOverrides[id] ?? recordingScene])) as Record<SceneId, Scene>
  let clock = 1000
  const callbacks = new Map<number, FrameRequestCallback>()
  let nextId = 1
  const options: PainterOptions = {
    scenes,
    now: () => clock,
    pixelRatio: () => ratio,
    requestFrame: (callback) => {
      const id = nextId++
      callbacks.set(id, callback)
      return id
    },
    cancelFrame: (id) => {
      callbacks.delete(id)
    },
    createLayer: () => canvasWith(layer.ctx),
  }
  const canvas = canvasWith(main.ctx)
  const painter = createBackdropPainter(canvas, options)!
  // Runs the pending animation frame `ms` milliseconds later.
  const advance = (ms: number) => {
    clock += ms
    const pending = [...callbacks.values()]
    callbacks.clear()
    for (const callback of pending) callback(clock)
  }
  return { painter, canvas, main, layer, frames, stills, advance, pending: () => callbacks.size }
}

describe('drawingRatio', () => {
  it('uses the screen ratio up to 1.5', () => {
    expect(drawingRatio(1, 1440, 900)).toBe(1)
    expect(drawingRatio(3, 1440, 900)).toBe(1.5)
    expect(drawingRatio(0, 1440, 900)).toBe(1)
  })

  it('draws big stages at a lower ratio to stay within the pixel budget', () => {
    const ratio = drawingRatio(2, 3840, 2160)
    expect(ratio).toBeLessThan(1)
    expect(3840 * ratio * 2160 * ratio).toBeLessThanOrEqual(3_500_001)
    expect(drawingRatio(2, 20000, 20000)).toBe(0.5)
  })
})

describe('createBackdropPainter', () => {
  it('is null without a 2D context', () => {
    expect(createBackdropPainter(canvasWith(null))).toBeNull()
  })

  it('draws nothing until it has both a backdrop and a layout', () => {
    const { painter, frames, main } = setup()
    painter.show(backdropOf('pose'))
    expect(frames).toHaveLength(0)
    expect(main.count('clearRect')).toBeGreaterThan(0)
    painter.setLayout(LAYOUT)
    expect(frames).toHaveLength(1)
  })

  it('sizes the canvas to the stage at a capped pixel ratio', () => {
    const { painter, canvas } = setup({}, 3)
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    expect(canvas.width).toBe(1440 * 1.5)
    expect(canvas.height).toBe(900 * 1.5)
  })

  it('keeps huge stages within the pixel budget', () => {
    const { painter, canvas } = setup({}, 2)
    painter.show(backdropOf('pose'))
    painter.setLayout(HUGE)
    expect(canvas.width * canvas.height).toBeLessThanOrEqual(3_510_000)
  })

  it('hands scenes a hairline width, the view, the reach and the theme palette', () => {
    const { painter, frames } = setup()
    painter.setTheme('light')
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    const frame = frames[0]
    expect(frame.px).toBeCloseTo(1 / LAYOUT.scale)
    expect(frame.view).toBe(LAYOUT.view)
    expect(frame.reach).toBe(LAYOUT.maskOuter)
    expect(frame.theme).toBe('light')
    expect(frame.motion).toBe(true)
  })

  it('animates at up to 30 frames a second only while running', () => {
    const { painter, frames, advance, pending } = setup()
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    expect(pending()).toBe(0)
    painter.setRunning(true)
    expect(pending()).toBe(1)
    const before = frames.length
    advance(10)
    expect(frames.length).toBe(before)
    advance(30)
    expect(frames.length).toBe(before + 1)
    painter.setRunning(false)
    expect(pending()).toBe(0)
    advance(100)
    expect(frames.length).toBe(before + 2)
  })

  it('draws a single still frame under reduced motion', () => {
    const { painter, frames, pending } = setup()
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    painter.setRunning(true)
    painter.setMotion(false)
    expect(pending()).toBe(0)
    const last = frames[frames.length - 1]
    expect(last.motion).toBe(false)
    expect(last.time).toBe(STILL_TIME)
  })

  it('caches still parts until the backdrop, theme, size or fonts change', () => {
    const { painter, stills, main, advance } = setup()
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    painter.setRunning(true)
    advance(40)
    advance(40)
    expect(stills).toHaveLength(1)
    expect(main.count('drawImage')).toBeGreaterThanOrEqual(3)
    painter.setTheme('light')
    expect(stills).toHaveLength(2)
    painter.refresh()
    expect(stills).toHaveLength(3)
    painter.setLayout(STACKED)
    expect(stills).toHaveLength(4)
    painter.show(backdropOf('ledger'))
    expect(stills).toHaveLength(5)
  })

  it('redraws the still parts for another project on the same scene', () => {
    const { painter, stills } = setup()
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    painter.show(backdropOf('pose', { ...PALETTE, accent: [200, 0, 0] }))
    expect(stills).toHaveLength(2)
  })

  it('skips the cache for scenes without still parts', () => {
    const { painter, main } = setup({ steam: { draw: () => undefined, glow: 'warm' } })
    painter.show(backdropOf('steam'))
    painter.setLayout(LAYOUT)
    expect(main.count('drawImage')).toBe(0)
  })

  it('fades stacked layouts out below the devices', () => {
    const { painter, main } = setup()
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    expect(main.count('createLinearGradient')).toBe(0)
    painter.setLayout(STACKED)
    expect(main.count('createLinearGradient')).toBe(1)
  })

  it('restores the context after a scene, even one that throws', () => {
    const failing: Scene = {
      draw: ({ ctx }) => {
        ctx.setLineDash([4, 4])
        throw new Error('scene failed')
      },
    }
    const { painter, main } = setup({ ocr: failing })
    painter.setLayout(LAYOUT)
    expect(() => painter.show(backdropOf('ocr'))).toThrow('scene failed')
    expect(main.count('save')).toBe(main.count('restore'))
  })

  it('ignores repeated settings', () => {
    const { painter, frames } = setup()
    const backdrop = backdropOf('pose')
    painter.show(backdrop)
    painter.setLayout(LAYOUT)
    const count = frames.length
    painter.show(backdrop)
    painter.setTheme('dark')
    painter.setMotion(true)
    painter.setRunning(false)
    painter.setLayout(computeLayout({ width: 1440, height: 900 }, { left: 650, top: 99, width: 718, height: 702 }, false))
    expect(frames.length).toBe(count)
  })

  it('hands back its memory when released, and draws again when next shown', () => {
    const { painter, canvas, stills, pending } = setup()
    const backdrop = backdropOf('pose')
    painter.show(backdrop)
    painter.setLayout(LAYOUT)
    painter.setRunning(true)
    painter.release()
    expect(pending()).toBe(0)
    expect(canvas.width).toBe(0)
    expect(canvas.height).toBe(0)
    painter.show(backdrop)
    expect(canvas.width).toBe(1440 * 1.5)
    expect(stills).toHaveLength(2)
  })

  it('stops for good when disposed', () => {
    const { painter, frames, pending } = setup()
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    painter.setRunning(true)
    painter.dispose()
    expect(pending()).toBe(0)
    const count = frames.length
    painter.setTheme('light')
    expect(frames.length).toBe(count)
  })

  it('leaves the canvas clear when the devices are hidden', () => {
    const { painter, frames, main } = setup()
    painter.show(backdropOf('pose'))
    painter.setLayout(LAYOUT)
    const clears = main.count('clearRect')
    painter.setLayout(null)
    expect(main.count('clearRect')).toBe(clears + 1)
    expect(frames).toHaveLength(1)
  })
})

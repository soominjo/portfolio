import type { Theme } from '../../../hooks/useTheme'
import { sameLayout, sceneTransform, VIRTUAL, type BackdropLayout } from './backdropLayout'
import type { GlowKind, Palette, ProjectBackdrop, Scene, SceneFrame, SceneId } from './backdropTypes'
import { ellipseGlow, STAGE_BACKGROUND } from './drawKit'
import { SCENES } from './scenes'

export interface PainterOptions {
  readonly scenes?: Readonly<Record<SceneId, Scene>>
  readonly requestFrame?: (callback: FrameRequestCallback) => number
  readonly cancelFrame?: (id: number) => void
  /** Milliseconds on the same clock as animation-frame timestamps. */
  readonly now?: () => number
  /** The screen's device-pixel ratio; the painter caps it. */
  readonly pixelRatio?: () => number
  /** Makes the off-screen canvas that caches a scene's still parts. */
  readonly createLayer?: () => HTMLCanvasElement
}

export interface BackdropPainter {
  /** The project backdrop to draw, or null for none (the canvas goes clear). */
  readonly show: (backdrop: ProjectBackdrop | null) => void
  readonly setLayout: (layout: BackdropLayout | null) => void
  readonly setTheme: (theme: Theme) => void
  /** False under reduced motion: one still frame instead of a loop. */
  readonly setMotion: (motion: boolean) => void
  /** Animates while true; holds the last frame while false. */
  readonly setRunning: (running: boolean) => void
  /** Redraws the cached still parts, for example once web fonts have loaded. */
  readonly refresh: () => void
  /** Stops and hands back the canvas memory until the next `show`. */
  readonly release: () => void
  readonly dispose: () => void
}

// Thirty frames a second is plenty for slow, faint motion and halves the cost.
const FRAME_MS = 1000 / 30
const MAX_PIXEL_RATIO = 1.5
// Big screens draw at a lower ratio, so each canvas stays under this many pixels.
const MAX_CANVAS_PIXELS = 3_500_000
const MIN_PIXEL_RATIO = 0.5
/** A moment, in seconds, when every scene looks complete; used for still frames. */
export const STILL_TIME = 37

type Transform = readonly [number, number, number, number, number, number]

/** The pixel ratio to draw a stage at: the screen's, capped, and lower on very large stages. */
export function drawingRatio(devicePixelRatio: number, width: number, height: number): number {
  const budget = Math.sqrt(MAX_CANVAS_PIXELS / Math.max(1, width * height))
  return Math.max(MIN_PIXEL_RATIO, Math.min(devicePixelRatio || 1, MAX_PIXEL_RATIO, budget))
}

function applyMask(ctx: CanvasRenderingContext2D, layout: BackdropLayout): void {
  const { view, maskInner, maskOuter, fade } = layout
  const width = view.right - view.left
  const height = view.bottom - view.top
  const radial = ctx.createRadialGradient(VIRTUAL.centerX, VIRTUAL.centerY, 0, VIRTUAL.centerX, VIRTUAL.centerY, maskOuter)
  radial.addColorStop(0, '#000')
  radial.addColorStop(Math.min(1, maskInner / maskOuter), '#000')
  radial.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = radial
  ctx.fillRect(view.left, view.top, width, height)
  if (!fade) return
  const below = ctx.createLinearGradient(0, fade.from, 0, fade.to)
  below.addColorStop(0, '#000')
  below.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = below
  ctx.fillRect(view.left, view.top, width, height)
}

function drawGlows(ctx: CanvasRenderingContext2D, kind: GlowKind, palette: Palette, layout: BackdropLayout, ratio: number, transform: Transform, time: number): void {
  const { width, height, anchorX, anchorY } = layout
  const { corner, glow, line } = palette
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  ellipseGlow(ctx, 0.85 * width, 0.85 * height, 0.3 * width, 0.35 * height, corner.rgb, corner.alpha * (kind === 'warm' ? 1.3 : 1))
  if (kind === 'base') {
    ellipseGlow(ctx, anchorX, anchorY, 0.45 * width, 0.5 * height, glow.rgb, glow.alpha)
    return
  }
  // Warm: pools of café light drifting slowly around the devices.
  const x = VIRTUAL.centerX
  const y = VIRTUAL.centerY
  ctx.setTransform(...transform)
  ellipseGlow(ctx, x - 330 + 70 * Math.cos(time * 0.05), y + 170 + 40 * Math.sin(time * 0.07), 380, 280, glow.rgb, glow.alpha * 0.8)
  ellipseGlow(ctx, x + 250 + 80 * Math.sin(time * 0.06), y - 250 + 40 * Math.cos(time * 0.05), 320, 220, line.rgb, line.alpha * 0.6)
  ellipseGlow(ctx, x + 160 * Math.sin(time * 0.04), y - 120 + 60 * Math.cos(time * 0.06), 560, 400, glow.rgb, glow.alpha * 1.1)
}

/** Runs a scene's drawing with the context state saved, so a scene can never leak settings, even if it throws. */
function isolated(ctx: CanvasRenderingContext2D, draw: () => void): void {
  ctx.save()
  try {
    draw()
  } finally {
    ctx.restore()
  }
}

/**
 * Draws one project's backdrop scene on a canvas: the scene in virtual units,
 * faded out around the devices, over its glows and the section background.
 * Returns null when the canvas has no 2D context.
 */
export function createBackdropPainter(canvas: HTMLCanvasElement, options: PainterOptions = {}): BackdropPainter | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const scenes = options.scenes ?? SCENES
  const requestFrame = options.requestFrame ?? ((callback: FrameRequestCallback) => window.requestAnimationFrame(callback))
  const cancelFrame = options.cancelFrame ?? ((id: number) => window.cancelAnimationFrame(id))
  const now = options.now ?? (() => performance.now())
  const pixelRatio = options.pixelRatio ?? (() => window.devicePixelRatio || 1)
  const createLayer = options.createLayer ?? (() => document.createElement('canvas'))
  const startedAt = now()

  let backdrop: ProjectBackdrop | null = null
  let layout: BackdropLayout | null = null
  let theme: Theme = 'dark'
  let motion = true
  let running = false
  let disposed = false
  let frameId = 0
  let lastPaint = -Infinity
  let version = 0
  let layerCanvas: HTMLCanvasElement | null = null
  let layerKey = ''
  let layerBackdrop: ProjectBackdrop | null = null

  const animating = () => !disposed && running && motion && backdrop !== null && layout !== null
  const sceneTime = () => (motion ? (now() - startedAt) / 1000 : STILL_TIME)

  const frameFor = (target: CanvasRenderingContext2D, time: number, palette: Palette, current: BackdropLayout): SceneFrame => ({
    ctx: target,
    time,
    motion,
    theme,
    palette,
    px: 1 / current.scale,
    view: current.view,
    reach: current.maskOuter,
  })

  const stopLoop = () => {
    if (frameId) cancelFrame(frameId)
    frameId = 0
  }

  // The scene's still parts, drawn once per backdrop, theme, size and font load.
  const stillLayer = (scene: Scene, palette: Palette, current: BackdropLayout, transform: Transform, time: number): HTMLCanvasElement | null => {
    if (!scene.drawStatic || !backdrop) return null
    const key = [theme, canvas.width, canvas.height, current.scale, current.anchorX, current.anchorY, version].join('|')
    if (layerCanvas && layerKey === key && layerBackdrop === backdrop) return layerCanvas
    const layer = layerCanvas ?? createLayer()
    layerCanvas = layer
    // Setting the size also wipes the old picture.
    layer.width = canvas.width
    layer.height = canvas.height
    const layerCtx = layer.getContext('2d')
    if (!layerCtx) return null
    const drawStatic = scene.drawStatic
    layerCtx.setTransform(...transform)
    isolated(layerCtx, () => drawStatic(frameFor(layerCtx, time, palette, current)))
    layerKey = key
    layerBackdrop = backdrop
    return layer
  }

  const clear = () => {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const paint = (time: number) => {
    if (!backdrop || !layout) {
      clear()
      return
    }
    const ratio = drawingRatio(pixelRatio(), layout.width, layout.height)
    const width = Math.max(1, Math.round(layout.width * ratio))
    const height = Math.max(1, Math.round(layout.height * ratio))
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    const scene = scenes[backdrop.scene]
    const palette = backdrop.palettes[theme]
    const current = layout
    const transform = sceneTransform(current, ratio)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    clear()
    const layer = stillLayer(scene, palette, current, transform, time)
    if (layer) ctx.drawImage(layer, 0, 0)
    ctx.setTransform(...transform)
    isolated(ctx, () => scene.draw(frameFor(ctx, time, palette, current)))
    ctx.globalCompositeOperation = 'destination-in'
    applyMask(ctx, current)
    ctx.globalCompositeOperation = 'destination-over'
    drawGlows(ctx, scene.glow ?? 'base', palette, current, ratio, transform, time)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = STAGE_BACKGROUND[theme]
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = 'source-over'
  }

  const tick = (timestamp: number) => {
    frameId = 0
    if (!animating()) return
    if (timestamp - lastPaint >= FRAME_MS - 1) {
      lastPaint = timestamp
      paint(sceneTime())
    }
    frameId = requestFrame(tick)
  }

  // After any change: repaint at once, then keep animating only if we should.
  const update = () => {
    if (disposed) return
    paint(sceneTime())
    lastPaint = now()
    if (animating()) {
      if (!frameId) frameId = requestFrame(tick)
    } else {
      stopLoop()
    }
  }

  return {
    show: (next) => {
      if (next === backdrop) return
      backdrop = next
      update()
    },
    setLayout: (next) => {
      const unchanged = sameLayout(next, layout)
      layout = next
      if (!unchanged) update()
    },
    setTheme: (next) => {
      if (next === theme) return
      theme = next
      update()
    },
    setMotion: (next) => {
      if (next === motion) return
      motion = next
      update()
    },
    setRunning: (next) => {
      if (next === running) return
      running = next
      update()
    },
    refresh: () => {
      version += 1
      update()
    },
    release: () => {
      stopLoop()
      running = false
      backdrop = null
      layerCanvas = null
      layerKey = ''
      layerBackdrop = null
      canvas.width = 0
      canvas.height = 0
    },
    dispose: () => {
      disposed = true
      stopLoop()
      clear()
    },
  }
}

import type { Theme } from '../../hooks/useTheme'
import { cursorZone, type CursorZone } from './cursorRules'
import { advance, burst, capParticles, emitAlong, particleLook, type Particle, type Point, type Random } from './exhaust'

export interface ExhaustOptions {
  /** Read on every frame, so a theme switch shows at once. */
  readonly getTheme: () => Theme
  readonly random?: Random
}

export interface ExhaustEngine {
  readonly dispose: () => void
}

type FlightZone = Exclude<CursorZone, 'other'>

// Over links and buttons the engine burns hotter: denser, faster exhaust.
const SPACING: Record<FlightZone, number> = { rocket: 4, lit: 3 }
const POWER: Record<FlightZone, number> = { rocket: 1, lit: 1.5 }
const BURST_COUNT = 24
const MAX_PIXEL_RATIO = 2
const MAX_FRAME_SECONDS = 0.05

/**
 * Where a pointer event can leave visible exhaust, or null where it can't:
 * - over the page scrollbars, which show the system cursor;
 * - inside an open dialog, which sits in the top layer above this canvas;
 * - wherever the cursor isn't the rocket (text fields, disabled controls).
 */
function flightZone(event: PointerEvent): FlightZone | null {
  const root = document.documentElement
  const width = root.clientWidth || window.innerWidth
  const height = root.clientHeight || window.innerHeight
  if (event.clientX >= width || event.clientY >= height) return null
  if (event.target instanceof Element && event.target.closest('dialog[open]')) return null
  const zone = cursorZone(event.target)
  return zone === 'other' ? null : zone
}

/**
 * Draws the rocket cursor's exhaust on a full-window canvas. It follows mouse
 * moves and presses anywhere on the page, and it only asks for animation
 * frames, and only shows the canvas, while there is exhaust to draw. It
 * returns null when the canvas has no 2D context. The rocket itself is a CSS
 * cursor image (see index.css).
 */
export function startExhaust(canvas: HTMLCanvasElement, options: ExhaustOptions): ExhaustEngine | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const random = options.random ?? Math.random

  let particles: readonly Particle[] = []
  let last: Point | null = null
  let carry = 0
  let frameId = 0
  let lastTime = 0
  let width = 0
  let height = 0
  let disposed = false

  // The canvas's own box leaves out the page scrollbar, unlike innerWidth.
  const fit = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
    width = canvas.clientWidth || window.innerWidth
    height = canvas.clientHeight || window.innerHeight
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  }

  const draw = () => {
    const theme = options.getTheme()
    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = theme === 'light' ? 'source-over' : 'lighter'
    for (const particle of particles) {
      const look = particleLook(particle, theme)
      ctx.globalAlpha = look.alpha
      ctx.fillStyle = look.color
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, look.radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  const frame = (time: number) => {
    frameId = 0
    if (disposed) return
    const dt = lastTime ? Math.min((time - lastTime) / 1000, MAX_FRAME_SECONDS) : 1 / 60
    lastTime = time
    particles = advance(particles, dt)
    draw()
    if (particles.length > 0) {
      frameId = requestAnimationFrame(frame)
    } else {
      lastTime = 0
      // An idle, empty canvas still costs the compositor a full-window layer.
      canvas.style.visibility = 'hidden'
    }
  }

  const add = (more: readonly Particle[]) => {
    if (disposed || more.length === 0) return
    particles = capParticles([...particles, ...more])
    if (!frameId) {
      canvas.style.visibility = 'visible'
      frameId = requestAnimationFrame(frame)
    }
  }

  // Forget the last position, so the next move doesn't streak across the page.
  const land = () => {
    last = null
    carry = 0
  }

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const zone = flightZone(event)
    if (!zone) {
      land()
      return
    }
    const point = { x: event.clientX, y: event.clientY }
    if (last) {
      const trail = emitAlong(last, point, carry, SPACING[zone], POWER[zone], random)
      carry = trail.carry
      add(trail.particles)
    }
    last = point
  }

  const onDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !flightZone(event)) return
    add(burst({ x: event.clientX, y: event.clientY }, BURST_COUNT, random))
  }

  canvas.style.visibility = 'hidden'
  fit()
  const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null
  resizeObserver?.observe(canvas)
  window.addEventListener('resize', fit)
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('blur', land)
  document.documentElement.addEventListener('pointerleave', land)

  return {
    dispose: () => {
      disposed = true
      cancelAnimationFrame(frameId)
      frameId = 0
      resizeObserver?.disconnect()
      window.removeEventListener('resize', fit)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('blur', land)
      document.documentElement.removeEventListener('pointerleave', land)
      ctx.clearRect(0, 0, width, height)
    },
  }
}

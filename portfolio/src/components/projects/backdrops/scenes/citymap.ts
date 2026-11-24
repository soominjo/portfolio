import type { Scene } from '../backdropTypes'
import { dot, INK, label, rgba } from '../drawKit'
import { easeOut, loopAt, seededRandom } from '../sceneMath'

// Leads Management System: a street map where listing pins drop in one by
// one, some with prices, joined like a sales pipeline. This project shows no
// phone, so the laptop sits alone in the middle (lid x 758-1258).

export const STREETS_ACROSS: readonly number[] = [64, 138, 196, 712, 776, 852]
export const STREETS_DOWN: readonly number[] = [596, 668, 742, 884, 1004, 1118, 1262, 1336, 1408]
const AVENUES: readonly (readonly [number, number, number, number])[] = [
  [540, 330, 900, -30],
  [1180, 930, 1560, 550],
]

export interface Pin {
  readonly x: number
  readonly y: number
  readonly price: string
}

export const PINS: readonly Pin[] = [
  { x: 706, y: 104, price: '₱4.5M' },
  { x: 826, y: 168, price: '' },
  { x: 962, y: 92, price: '₱8.2M' },
  { x: 1180, y: 166, price: '' },
  { x: 1300, y: 104, price: '₱5.9M' },
  { x: 1372, y: 300, price: '' },
  { x: 1378, y: 820, price: '₱3.1M' },
  { x: 1190, y: 744, price: '' },
  { x: 948, y: 818, price: '₱2.7M' },
  { x: 716, y: 748, price: '' },
]

/** Building footprints, kept off the streets and out from behind the laptop: x, y, width, height. */
export const BUILDINGS: readonly (readonly [number, number, number, number])[] = (() => {
  const random = seededRandom(3)
  const candidates = Array.from({ length: 60 }, () => [560 + random() * 900, 10 + random() * 880, 8 + random() * 18, 8 + random() * 14] as const)
  return candidates.filter(([x, y, width, height]) => {
    const behindLaptop = x > 690 && x < 1330 && y > 220 && y < 690
    const onStreet =
      STREETS_ACROSS.some((street) => Math.abs(y + height / 2 - street) < height / 2 + 7) ||
      STREETS_DOWN.some((street) => Math.abs(x + width / 2 - street) < width / 2 + 7)
    return !behindLaptop && !onStreet
  })
})()

const PIN_GAP = 0.9

function drawPin(ctx: CanvasRenderingContext2D, x: number, y: number, accent: readonly [number, number, number], hole: readonly [number, number, number], alpha: number): void {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.bezierCurveTo(x - 4, y - 8, x - 8, y - 11, x - 8, y - 16)
  ctx.arc(x, y - 16, 8, Math.PI, 0)
  ctx.bezierCurveTo(x + 8, y - 11, x + 4, y - 8, x, y)
  ctx.closePath()
  ctx.fillStyle = rgba(accent, 0.85 * alpha)
  ctx.fill()
  dot(ctx, x, y - 16, 3, hole, 0.9 * alpha)
}

export const citymap: Scene = {
  drawStatic: ({ ctx, view, palette, px }) => {
    const { rgb, alpha } = palette.line
    ctx.lineWidth = px
    ctx.strokeStyle = rgba(rgb, alpha * 1.3)
    ctx.beginPath()
    for (const y of STREETS_ACROSS) {
      for (const edge of [-5, 5]) {
        ctx.moveTo(view.left, y + edge)
        ctx.lineTo(view.right, y + edge)
      }
    }
    for (const x of STREETS_DOWN) {
      for (const edge of [-5, 5]) {
        ctx.moveTo(x + edge, view.top)
        ctx.lineTo(x + edge, view.bottom)
      }
    }
    for (const [ax, ay, bx, by] of AVENUES) {
      ctx.moveTo(ax, ay)
      ctx.lineTo(bx, by)
      ctx.moveTo(ax + 14, ay + 14)
      ctx.lineTo(bx + 14, by + 14)
    }
    ctx.stroke()
    ctx.fillStyle = rgba(rgb, alpha * 0.9)
    for (const [x, y, width, height] of BUILDINGS) ctx.fillRect(x, y, width, height)
  },
  draw: ({ ctx, time, motion, theme, palette, px }) => {
    const { fade, local } = loopAt(time, motion, { period: 14, build: 9.5, hold: 2.5 })
    const shown = PINS.map((pin, index) => ({ pin, age: local - index * PIN_GAP })).filter(({ age }) => age >= 0)
    if (shown.length > 1) {
      ctx.setLineDash([2 * px, 6 * px])
      ctx.lineWidth = px * 1.2
      ctx.strokeStyle = rgba(palette.accent, 0.35 * fade)
      ctx.beginPath()
      shown.forEach(({ pin }, index) => (index ? ctx.lineTo(pin.x, pin.y) : ctx.moveTo(pin.x, pin.y)))
      ctx.stroke()
      ctx.setLineDash([])
    }
    const hole = theme === 'dark' ? ([5, 7, 15] as const) : ([255, 255, 255] as const)
    for (const { pin, age } of shown) {
      const landed = easeOut(age / 0.45)
      const y = pin.y - (1 - landed) * 26
      const alpha = fade * landed
      if (age < 1.6) {
        const radius = age * 22
        ctx.lineWidth = px
        ctx.strokeStyle = rgba(palette.accent, (1 - age / 1.6) * 0.6 * fade)
        ctx.beginPath()
        ctx.ellipse(pin.x, pin.y, radius, radius * 0.45, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      drawPin(ctx, pin.x, y, palette.accent, hole, alpha)
      if (pin.price) label(ctx, pin.price, pin.x + 12, y - 14, { rgb: INK[theme], alpha: 0.6 * alpha, size: 10, spacing: 1, px })
    }
  },
}

import type { Scene } from '../backdropTypes'
import { rgba } from '../drawKit'
import { wave } from '../sceneMath'

// unwnd.cafe: steam curling up from behind the devices, over warm café light
// (the painter's 'warm' glow).

export interface Wisp {
  readonly x: number
  /** Where the wisp starts, just behind the top of the laptop lid or the phone. */
  readonly y: number
  readonly length: number
  readonly phase: number
  readonly speed: number
}

export const WISPS: readonly Wisp[] = [
  { x: 770, y: 252, length: 300, phase: 0, speed: 0.55 },
  { x: 900, y: 246, length: 340, phase: 2.1, speed: 0.48 },
  { x: 1040, y: 252, length: 310, phase: 4, speed: 0.6 },
  { x: 1150, y: 256, length: 280, phase: 1.2, speed: 0.5 },
  { x: 1330, y: 440, length: 330, phase: 3.3, speed: 0.52 },
]

const STEPS = 48
// A wide faint stroke under a thin brighter one reads as vapour, not a wire.
const LAYERS: readonly (readonly [width: number, strength: number])[] = [
  [11, 0.16],
  [4, 0.32],
  [1.4, 0.85],
]

/** One strand of a wisp at `time`: it sways more as it rises and drifts a little to the right. */
export function wispPath(wisp: Wisp, strand: number, time: number): readonly (readonly [number, number])[] {
  return Array.from({ length: STEPS + 1 }, (_, step) => {
    const along = step / STEPS
    const sway = (4 + 26 * along) * Math.sin(along * 6.2 - time * wisp.speed * 2 + wisp.phase + strand * 1.4)
    return [wisp.x + sway + strand * 9 * along + 22 * along * along, wisp.y - along * wisp.length] as const
  })
}

export const steam: Scene = {
  glow: 'warm',
  draw: ({ ctx, time, palette, px }) => {
    const { rgb, alpha } = palette.line
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const wisp of WISPS) {
      const life = 0.2 + 0.8 * Math.pow(wave(time * 0.3 + wisp.phase * 1.7), 1.5)
      // One fade along the wisp; each stroke sets its own strength through globalAlpha.
      const fade = ctx.createLinearGradient(0, wisp.y, 0, wisp.y - wisp.length)
      fade.addColorStop(0, rgba(rgb, 0))
      fade.addColorStop(0.22, rgba(rgb, 1))
      fade.addColorStop(0.6, rgba(rgb, 0.45))
      fade.addColorStop(0.92, rgba(rgb, 0))
      ctx.strokeStyle = fade
      for (let strand = 0; strand < 2; strand++) {
        const path = wispPath(wisp, strand, time)
        ctx.beginPath()
        path.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
        const strength = alpha * 3 * life * (strand ? 0.6 : 1)
        for (const [width, share] of LAYERS) {
          ctx.globalAlpha = Math.min(1, strength * share)
          ctx.lineWidth = Math.max(px, width)
          ctx.stroke()
        }
      }
    }
    ctx.globalAlpha = 1
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'miter'
  },
}

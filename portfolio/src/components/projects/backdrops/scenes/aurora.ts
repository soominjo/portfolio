import { VIRTUAL } from '../backdropLayout'
import type { Palette, Rgb, Scene } from '../backdropTypes'
import { rgba } from '../drawKit'

// Reviva: soft aurora curtains drifting above and below the devices. Uses
// `accent2` (green) and `accent3` (violet) beside `accent` (pink).

export interface Ribbon {
  /** The curtain's lower edge, where it glows brightest. */
  readonly y: number
  readonly sway: number
  readonly frequency: number
  readonly drift: number
  readonly height: number
  readonly colour: 'accent' | 'accent2' | 'accent3'
  readonly phase: number
}

export const RIBBONS: readonly Ribbon[] = [
  { y: 175, sway: 30, frequency: 0.006, drift: 0.18, height: 125, colour: 'accent2', phase: 0 },
  { y: 205, sway: 22, frequency: 0.009, drift: -0.13, height: 90, colour: 'accent', phase: 2 },
  { y: 830, sway: 26, frequency: 0.007, drift: 0.15, height: 120, colour: 'accent2', phase: 4 },
  { y: 800, sway: 20, frequency: 0.011, drift: -0.1, height: 85, colour: 'accent3', phase: 1 },
]

/** Where a ribbon's lower edge is at `x`. */
export function ribbonEdge(ribbon: Ribbon, x: number, time: number): number {
  return (
    ribbon.y +
    ribbon.sway * Math.sin(ribbon.frequency * x + ribbon.drift * time + ribbon.phase) +
    0.4 * ribbon.sway * Math.sin(2.3 * ribbon.frequency * x - 0.7 * ribbon.drift * time)
  )
}

/** How tall a ribbon's curtain is at `x`. */
export function ribbonHeight(ribbon: Ribbon, x: number, time: number): number {
  return ribbon.height * (0.6 + 0.4 * Math.sin(0.013 * x + 0.4 * time + ribbon.phase))
}

/** Which of `bands` brightness bands the ray at `x` falls in, from 0 (faintest). */
export function rayBand(ribbon: Ribbon, x: number, time: number, bands: number): number {
  const brightness = 0.5 + 0.5 * Math.sin(x * 0.09 + time * 0.6 + ribbon.phase)
  return Math.min(bands - 1, Math.floor(brightness * bands))
}

const colourOf = (palette: Palette, ribbon: Ribbon): Rgb => palette[ribbon.colour] ?? palette.accent
// Rays are grouped into a few brightness bands, one gradient and one stroke each.
const RAY_BANDS = 4
const RAY_GAP = 12

function drawCurtain(ctx: CanvasRenderingContext2D, ribbon: Ribbon, rgb: Rgb, left: number, right: number, time: number): void {
  ctx.beginPath()
  for (let x = left; x <= right; x += 8) ctx.lineTo(x, ribbonEdge(ribbon, x, time) - ribbonHeight(ribbon, x, time))
  for (let x = right; x >= left; x -= 8) ctx.lineTo(x, ribbonEdge(ribbon, x, time))
  ctx.closePath()
  const curtain = ctx.createLinearGradient(0, ribbon.y - ribbon.height - ribbon.sway, 0, ribbon.y + ribbon.sway)
  curtain.addColorStop(0, rgba(rgb, 0))
  curtain.addColorStop(0.7, rgba(rgb, 0.14))
  curtain.addColorStop(0.86, rgba(rgb, 0.24))
  curtain.addColorStop(1, rgba(rgb, 0))
  ctx.fillStyle = curtain
  ctx.fill()
}

// Fine vertical rays give the curtain its texture.
function drawRays(ctx: CanvasRenderingContext2D, ribbon: Ribbon, rgb: Rgb, left: number, right: number, time: number, px: number): void {
  const top = ribbon.y - ribbon.height - ribbon.sway
  const bottom = ribbon.y + ribbon.sway
  const edgeShare = ribbon.height / (ribbon.height + 2 * ribbon.sway)
  ctx.lineWidth = px * 1.2
  for (let band = 0; band < RAY_BANDS; band++) {
    const strength = (0.16 * (band + 0.5)) / RAY_BANDS
    ctx.beginPath()
    for (let x = Math.ceil(left / RAY_GAP) * RAY_GAP; x <= right; x += RAY_GAP) {
      if (rayBand(ribbon, x, time, RAY_BANDS) !== band) continue
      const edge = ribbonEdge(ribbon, x, time)
      ctx.moveTo(x, edge)
      ctx.lineTo(x, edge - ribbonHeight(ribbon, x, time) * 0.9)
    }
    const ray = ctx.createLinearGradient(0, top, 0, bottom)
    ray.addColorStop(0, rgba(rgb, 0))
    ray.addColorStop(edgeShare, rgba(rgb, strength * 0.85))
    ray.addColorStop(1, rgba(rgb, strength))
    ctx.strokeStyle = ray
    ctx.stroke()
  }
}

export const aurora: Scene = {
  draw: ({ ctx, time, palette, px, view, reach }) => {
    // Only draw where the fade lets anything show.
    const left = Math.max(view.left, VIRTUAL.centerX - reach)
    const right = Math.min(view.right, VIRTUAL.centerX + reach)
    if (right <= left) return
    // Overlapping curtains add up, like light.
    ctx.globalCompositeOperation = 'lighter'
    for (const ribbon of RIBBONS) {
      const rgb = colourOf(palette, ribbon)
      drawCurtain(ctx, ribbon, rgb, left, right, time)
      drawRays(ctx, ribbon, rgb, left, right, time, px)
    }
    ctx.globalCompositeOperation = 'source-over'
  },
}

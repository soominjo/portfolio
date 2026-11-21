import type { Theme } from '../../../hooks/useTheme'
import type { Rgb, ViewRect } from './backdropTypes'
import { TAU } from './sceneMath'

/** Text colour for labels, per theme. */
export const INK: Readonly<Record<Theme, Rgb>> = { dark: [226, 232, 240], light: [30, 41, 59] }

/** The section background (Projects.tsx), which the canvas paints under each scene. */
export const STAGE_BACKGROUND: Readonly<Record<Theme, string>> = { dark: '#05070f', light: '#f7f9fc' }

// Labels never shrink below this many CSS pixels, however small the stage.
const MIN_TEXT_CSS_PX = 7

export function rgba(rgb: Rgb, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha))
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
}

/** A filled dot, with an optional soft halo around it. */
export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, rgb: Rgb, alpha: number, halo = 0): void {
  if (halo > 0) {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, halo)
    glow.addColorStop(0, rgba(rgb, alpha * 0.5))
    glow.addColorStop(1, rgba(rgb, 0))
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(x, y, halo, 0, TAU)
    ctx.fill()
  }
  ctx.fillStyle = rgba(rgb, alpha)
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, TAU)
  ctx.fill()
}

export interface LabelStyle {
  readonly rgb: Rgb
  readonly alpha: number
  /** Font size in virtual units. */
  readonly size?: number
  readonly align?: CanvasTextAlign
  /** Letter spacing in virtual units. */
  readonly spacing?: number
  /** One CSS pixel in virtual units, so small stages keep labels legible. */
  readonly px: number
}

/** A line of monospace label text, like the site's `font-mono-label`. */
export function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, style: LabelStyle): void {
  const { rgb, alpha, size = 11, align = 'left', spacing = 1.5, px } = style
  const fontSize = Math.max(size, MIN_TEXT_CSS_PX * px)
  ctx.font = `500 ${fontSize}px "JetBrains Mono", ui-monospace, monospace`
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`
  ctx.textAlign = align
  ctx.fillStyle = rgba(rgb, alpha)
  ctx.fillText(text, x, y)
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px'
  ctx.textAlign = 'start'
}

/** A soft elliptical glow that fades out by 70% of its radii, like the CSS glows. */
export function ellipseGlow(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rgb: Rgb, alpha: number): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(rx, ry)
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
  glow.addColorStop(0, rgba(rgb, alpha))
  glow.addColorStop(0.7, rgba(rgb, 0))
  ctx.fillStyle = glow
  ctx.fillRect(-1, -1, 2, 2)
  ctx.restore()
}

/** Square grid lines every `step` units across the view. */
export function gridLines(ctx: CanvasRenderingContext2D, view: ViewRect, step: number, rgb: Rgb, alpha: number, width: number): void {
  ctx.lineWidth = width
  ctx.strokeStyle = rgba(rgb, alpha)
  ctx.beginPath()
  for (let x = Math.floor(view.left / step) * step; x < view.right; x += step) {
    ctx.moveTo(x, view.top)
    ctx.lineTo(x, view.bottom)
  }
  for (let y = Math.floor(view.top / step) * step; y < view.bottom; y += step) {
    ctx.moveTo(view.left, y)
    ctx.lineTo(view.right, y)
  }
  ctx.stroke()
}

/** Small square dots every `step` units across the view, like map paper. */
export function dotGrid(ctx: CanvasRenderingContext2D, view: ViewRect, step: number, size: number, rgb: Rgb, alpha: number): void {
  ctx.fillStyle = rgba(rgb, alpha)
  const offset = step / 2
  for (let y = Math.floor(view.top / step) * step + offset; y < view.bottom; y += step) {
    for (let x = Math.floor(view.left / step) * step + offset; x < view.right; x += step) {
      ctx.fillRect(x - size / 2, y - size / 2, size, size)
    }
  }
}

/** A rounded rectangle path, or a plain one where roundRect is missing. */
export function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, width, height, radius)
  else ctx.rect(x, y, width, height)
}

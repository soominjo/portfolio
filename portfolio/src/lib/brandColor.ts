/**
 * Colour helpers for drawing brand marks on themed tiles.
 *
 * Contrast uses the WCAG 2 relative-luminance formula. 3:1 is the minimum
 * for graphics people need to recognise (success criterion 1.4.11).
 */

type Rgb = readonly [number, number, number]

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i
const DEFAULT_MIN_RATIO = 3
// readableOn() blends toward the foreground in 5% steps.
const MIX_STEPS = 20
// Marks whose channels spread less than this are black, white or grey.
// Blending those only produces a muddy grey, so they take the foreground.
const ACHROMATIC_SPREAD = 0.1

/** Returns `#rrggbb` in lower case. Throws unless given six hex digits. */
export function normalizeHex(hex: string): string {
  const match = HEX_PATTERN.exec(hex.trim())
  if (!match) {
    throw new Error(`Expected a six-digit hex colour, got "${hex}"`)
  }
  return `#${match[1].toLowerCase()}`
}

function toRgb(hex: string): Rgb {
  const value = Number.parseInt(normalizeHex(hex).slice(1), 16)
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff]
}

function toHex(rgb: Rgb): string {
  return `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`
}

function toLinear(channel: number): number {
  const value = channel / 255
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** WCAG contrast ratio between two colours, from 1 (none) to 21. */
export function contrastRatio(a: string, b: string): number {
  const first = relativeLuminance(toRgb(a))
  const second = relativeLuminance(toRgb(b))
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

/** Blends `from` toward `to`; `amount` 0 gives `from` and 1 gives `to`. */
export function mixHex(from: string, to: string, amount: number): string {
  const t = Math.min(1, Math.max(0, amount))
  const [r1, g1, b1] = toRgb(from)
  const [r2, g2, b2] = toRgb(to)
  return toHex([r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t])
}

function isAchromatic(hex: string): boolean {
  const rgb = toRgb(hex)
  return (Math.max(...rgb) - Math.min(...rgb)) / 255 < ACHROMATIC_SPREAD
}

/**
 * The brand colour to draw on `background` so it reads at `minRatio` or better.
 * A colour that already passes is kept. A failing one is blended toward
 * `foreground` (the theme's text colour) only as far as needed, so the hue
 * survives. Black and grey marks take `foreground` outright.
 */
export function readableOn(
  hex: string,
  background: string,
  foreground: string,
  minRatio: number = DEFAULT_MIN_RATIO,
): string {
  const brand = normalizeHex(hex)
  const fallback = normalizeHex(foreground)

  if (contrastRatio(brand, background) >= minRatio) return brand
  if (isAchromatic(brand)) return fallback

  for (let step = 1; step < MIX_STEPS; step += 1) {
    const blended = mixHex(brand, fallback, step / MIX_STEPS)
    if (contrastRatio(blended, background) >= minRatio) return blended
  }
  return fallback
}

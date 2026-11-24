import type { Scene } from '../backdropTypes'
import { INK, label, rgba, roundedRect } from '../drawKit'
import { clamp01, loopAt, seededRandom } from '../sceneMath'

// Maneho.ai: a scan line reads a faint citation, word by word, and boxes the
// fields it finds. Uses `accent2` for the violation.

/** Faint "words" in rows above and below the devices: x, y, width. */
export const WORDS: readonly (readonly [number, number, number])[] = (() => {
  const random = seededRandom(21)
  const bands: readonly (readonly [number, number])[] = [
    [44, 206],
    [704, 866],
  ]
  return bands.flatMap(([from, to]) => {
    const rows = Math.floor((to - from) / 22) + 1
    return Array.from({ length: rows }, (_, row) => {
      const y = from + row * 22
      const words: (readonly [number, number, number])[] = []
      let x = 610 + (random() < 0.3 ? 24 : 0)
      while (x < 1400) {
        const width = 18 + random() * 70
        words.push([x, y, width])
        x += width + 9 + random() * 6
      }
      return words
    }).flat()
  })
})()

export interface Field {
  readonly name: string
  /** Index into WORDS. */
  readonly word: number
  readonly confidence: number
  /** Drawn in the warning colour. */
  readonly warn?: boolean
}

export const FIELDS: readonly Field[] = [
  { name: 'PLATE NO.', word: 9, confidence: 0.99 },
  { name: 'VIOLATION', word: 31, confidence: 0.97, warn: true },
  { name: 'FINE', word: 62, confidence: 0.98 },
  { name: 'DATE', word: 118, confidence: 0.99 },
]

const SCAN_TOP = 28
const SCAN_TRAVEL = 860

export const ocr: Scene = {
  draw: ({ ctx, time, motion, theme, palette, px }) => {
    const { rgb, alpha } = palette.line
    const { progress, fade } = loopAt(time, motion, { period: 8, build: 6.4, hold: 0.6 })
    const scanY = SCAN_TOP + progress * SCAN_TRAVEL
    for (const [x, y, width] of WORDS) {
      // Words light up as the scan passes, then settle back.
      const glow = y < scanY ? Math.exp(-(scanY - y) / 70) : 0
      ctx.fillStyle = rgba(rgb, alpha * (1.4 + 3.5 * glow * fade))
      ctx.beginPath()
      roundedRect(ctx, x, y - 3.5, width, 7, 3.5)
      ctx.fill()
    }
    for (const field of FIELDS) {
      const [x, y, width] = WORDS[field.word]
      if (y > scanY) continue
      const colour = field.warn ? (palette.accent2 ?? palette.accent) : palette.accent
      const shown = fade * clamp01((scanY - y) / 40)
      ctx.lineWidth = px * 1.3
      ctx.strokeStyle = rgba(colour, 0.8 * shown)
      ctx.strokeRect(x - 5, y - 9, width + 10, 18)
      label(ctx, `${field.name} · ${field.confidence.toFixed(2)}`, x - 5, y - 14, { rgb: colour, alpha: 0.85 * shown, size: 9, spacing: 1.2, px })
    }
    const trail = ctx.createLinearGradient(0, scanY - 50, 0, scanY)
    trail.addColorStop(0, rgba(palette.accent, 0))
    trail.addColorStop(1, rgba(palette.accent, 0.1 * fade))
    ctx.fillStyle = trail
    ctx.fillRect(560, scanY - 50, 900, 50)
    ctx.lineWidth = px * 1.4
    ctx.strokeStyle = rgba(palette.accent, 0.6 * fade)
    ctx.beginPath()
    ctx.moveTo(560, scanY)
    ctx.lineTo(1460, scanY)
    ctx.stroke()
    label(ctx, 'OCR · READING CITATION', 600, Math.min(scanY - 8, 880), { rgb: INK[theme], alpha: 0.5 * fade, size: 9, spacing: 2, px })
  },
}

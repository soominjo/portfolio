import type { Scene } from '../backdropTypes'
import { dot, label, rgba } from '../drawKit'
import { clamp01, loopAt, seededRandom, TAU } from '../sceneMath'

// Mythica: constellations named in myth draw themselves in over faint stars.
// Uses `accent` for the lines and names, and `accent2` for the stars.

export interface Constellation {
  readonly name: string
  readonly x: number
  readonly y: number
  readonly size: number
  readonly stars: readonly (readonly [number, number])[]
  /** Pairs of star indexes, in drawing order. */
  readonly links: readonly (readonly [number, number])[]
}

export const CONSTELLATIONS: readonly Constellation[] = [
  { name: 'CASSIOPEIA', x: 700, y: 110, size: 1.25, stars: [[0, 0], [32, 26], [60, 6], [92, 34], [122, 4]], links: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  {
    name: 'URSA MAJOR',
    x: 1110,
    y: 70,
    size: 1.05,
    stars: [[0, 0], [34, 10], [62, 24], [90, 44], [92, 82], [142, 88], [148, 50]],
    links: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
  },
  { name: 'LYRA', x: 1350, y: 250, size: 1.1, stars: [[0, 0], [8, 30], [26, 26], [18, -4], [-10, -28]], links: [[4, 0], [0, 1], [1, 2], [2, 3], [3, 0]] },
  {
    name: 'ORION',
    x: 1120,
    y: 712,
    size: 0.85,
    stars: [[40, -32], [0, 0], [78, 8], [30, 72], [42, 76], [54, 80], [12, 148], [88, 140]],
    links: [[0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [3, 6], [5, 7]],
  },
  { name: 'CYGNUS', x: 760, y: 770, size: 1, stars: [[0, -70], [0, 0], [0, 40], [0, 92], [-62, 8], [60, -8]], links: [[0, 1], [1, 2], [2, 3], [4, 1], [1, 5]] },
]

/** Faint background stars: x, y, radius, twinkle phase. Spread wider than the stage for wide screens. */
export const SPECKS: readonly (readonly [number, number, number, number])[] = (() => {
  const random = seededRandom(7)
  return Array.from({ length: 220 }, () => [random() * 2100 - 300, random() * 1000 - 50, 0.5 + random() * 1.1, random() * TAU] as const)
})()

export const stars: Scene = {
  draw: ({ ctx, time, motion, theme, palette, px }) => {
    const starRgb = palette.accent2 ?? palette.accent
    const dark = theme === 'dark'
    for (const [x, y, radius, phase] of SPECKS) {
      const twinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(time * 1.1 + phase * 3))
      dot(ctx, x, y, Math.max(radius, px * 0.6), starRgb, (dark ? 0.6 : 0.45) * twinkle)
    }
    CONSTELLATIONS.forEach((constellation, index) => {
      const { progress, fade } = loopAt(time, motion, { period: 16, build: 3.2, hold: 8.8, offset: index * 3.2 })
      const points = constellation.stars.map(([sx, sy]) => [constellation.x + sx * constellation.size, constellation.y + sy * constellation.size] as const)
      const drawn = progress * constellation.links.length
      ctx.lineWidth = px * 1.1
      ctx.strokeStyle = rgba(palette.accent, (dark ? 0.45 : 0.4) * fade)
      ctx.beginPath()
      constellation.links.forEach(([from, to], link) => {
        if (link >= drawn) return
        const share = Math.min(1, drawn - link)
        const [ax, ay] = points[from]
        const [bx, by] = points[to]
        ctx.moveTo(ax, ay)
        ctx.lineTo(ax + (bx - ax) * share, ay + (by - ay) * share)
      })
      ctx.stroke()
      points.forEach(([x, y], star) => {
        dot(ctx, x, y, Math.max(2.2, px), starRgb, 0.95 * (0.7 + 0.3 * Math.sin(time * 1.4 + index * 1.7 + star * 2.3)), 10)
      })
      const lowest = Math.max(...constellation.stars.map(([, sy]) => sy)) * constellation.size
      const nameAlpha = 0.55 * fade * clamp01(progress * 1.5 - 0.5)
      label(ctx, constellation.name, constellation.x - 6, constellation.y + lowest + 26, { rgb: palette.accent, alpha: nameAlpha, spacing: 2, px })
    })
  },
}

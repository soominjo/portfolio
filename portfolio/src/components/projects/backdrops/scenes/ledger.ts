import type { Scene } from '../backdropTypes'
import { dot, INK, label, rgba } from '../drawKit'
import { clamp01, loopAt } from '../sceneMath'

// Commission Monitoring System: ledger paper, a commission chart rising
// through five tranches, and receivable bars along the bottom.

/** The chart line, left to right: it climbs from bottom-left to top-right with a few wobbles. */
export const CHART: readonly (readonly [number, number])[] = Array.from({ length: 89 }, (_, step) => {
  const x = 560 + step * 10
  const along = step / 88
  return [x, 830 - along * 700 - 40 * Math.sin(along * 9.5) * (1 - along * 0.5) - 14 * Math.sin(along * 23 + 1)] as const
})

export const TRANCHE_XS: readonly number[] = [640, 820, 1000, 1180, 1360]
const BAR_COUNT = 14
const BAR_BASE = 884

function drawChart(ctx: CanvasRenderingContext2D, reached: number, accent: readonly [number, number, number], fade: number, px: number): void {
  if (reached < 1) return
  const shown = CHART.slice(0, reached + 1)
  const [lastX, lastY] = shown[shown.length - 1]
  ctx.beginPath()
  ctx.moveTo(CHART[0][0], BAR_BASE)
  shown.forEach(([x, y]) => ctx.lineTo(x, y))
  ctx.lineTo(lastX, BAR_BASE)
  ctx.closePath()
  const area = ctx.createLinearGradient(0, 90, 0, BAR_BASE)
  area.addColorStop(0, rgba(accent, 0.14 * fade))
  area.addColorStop(1, rgba(accent, 0))
  ctx.fillStyle = area
  ctx.fill()
  ctx.beginPath()
  shown.forEach(([x, y], index) => (index ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.lineWidth = px * 2
  ctx.strokeStyle = rgba(accent, 0.7 * fade)
  ctx.stroke()
  dot(ctx, lastX, lastY, 4, accent, fade, 16)
}

export const ledger: Scene = {
  drawStatic: ({ ctx, view, palette, px }) => {
    const { rgb, alpha } = palette.line
    ctx.lineWidth = px
    ctx.strokeStyle = rgba(rgb, alpha * 0.8)
    ctx.beginPath()
    for (let y = Math.floor(view.top / 28) * 28; y < view.bottom; y += 28) {
      ctx.moveTo(view.left, y)
      ctx.lineTo(view.right, y)
    }
    ctx.stroke()
    ctx.strokeStyle = rgba(rgb, alpha * 1.5)
    ctx.beginPath()
    for (let x = Math.floor(view.left / 168) * 168; x < view.right; x += 168) {
      ctx.moveTo(x, view.top)
      ctx.lineTo(x, view.bottom)
    }
    ctx.stroke()
  },
  draw: ({ ctx, time, motion, theme, palette, px }) => {
    const { rgb, alpha } = palette.line
    const { progress, fade } = loopAt(time, motion, { period: 16, build: 9, hold: 4.5 })
    for (let bar = 0; bar < BAR_COUNT; bar++) {
      const height = (22 + 48 * (0.5 + 0.5 * Math.sin(bar * 1.7))) * clamp01(progress * 1.6 - bar * 0.05)
      ctx.fillStyle = rgba(rgb, alpha * 2.2 * fade)
      ctx.fillRect(572 + bar * 62, BAR_BASE - height, 18, height)
    }
    const reached = Math.floor(progress * (CHART.length - 1))
    drawChart(ctx, reached, palette.accent, fade, px)
    TRANCHE_XS.forEach((x, index) => {
      const point = Math.round((x - CHART[0][0]) / 10)
      const passed = reached >= point
      ctx.setLineDash([3 * px, 6 * px])
      ctx.lineWidth = px
      ctx.strokeStyle = rgba(rgb, alpha * (passed ? 3 : 1.5))
      ctx.beginPath()
      ctx.moveTo(x, 44)
      ctx.lineTo(x, BAR_BASE)
      ctx.stroke()
      ctx.setLineDash([])
      label(ctx, `TRANCHE ${index + 1}`, x + 6, 40, { rgb: INK[theme], alpha: passed ? 0.55 : 0.25, size: 10, px })
      if (!passed) return
      const [px0, py0] = CHART[point]
      dot(ctx, px0, py0, 3.2, palette.accent, 0.9 * fade, 10)
      label(ctx, `₱${(0.8 + index * 0.65).toFixed(1)}M`, px0 + 8, py0 - 9, { rgb: palette.accent, alpha: 0.85 * fade, size: 10, spacing: 1, px })
    })
  },
}

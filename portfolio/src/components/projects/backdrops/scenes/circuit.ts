import { VIRTUAL } from '../backdropLayout'
import type { Scene } from '../backdropTypes'
import { dot, INK, label, rgba } from '../drawKit'
import { TAU } from '../sceneMath'

// Switchboard: circuit traces route in from team channels towards the
// devices, with pulses of light running along them.

type Point = readonly [number, number]

export interface Trace {
  /** Start pad, bend, and end (behind the devices). */
  readonly points: readonly [Point, Point, Point]
  readonly tag: string
  readonly showTag: boolean
  /** Length of the first leg. */
  readonly firstLeg: number
  readonly length: number
}

const TAGS = ['#frontend', '#backend', '#design', '#qa', '#mobile', '#data', '#ops']

/** Fourteen traces fanned out around the devices: straight in along one axis, then at 45 degrees. */
export const TRACES: readonly Trace[] = Array.from({ length: 14 }, (_, index) => {
  const angle = (index / 14) * TAU + 0.21
  const start: Point = [
    Math.min(1480, Math.max(540, VIRTUAL.centerX + 760 * Math.cos(angle))),
    Math.min(885, Math.max(15, VIRTUAL.centerY + 640 * Math.sin(angle))),
  ]
  const end: Point = [VIRTUAL.centerX + 230 * Math.cos(angle), VIRTUAL.centerY + 200 * Math.sin(angle)]
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const bend: Point =
    Math.abs(dx) > Math.abs(dy)
      ? [start[0] + Math.sign(dx) * (Math.abs(dx) - Math.abs(dy)), start[1]]
      : [start[0], start[1] + Math.sign(dy) * (Math.abs(dy) - Math.abs(dx))]
  const firstLeg = Math.hypot(bend[0] - start[0], bend[1] - start[1])
  const length = firstLeg + Math.hypot(end[0] - bend[0], end[1] - bend[1])
  return { points: [start, bend, end], tag: TAGS[index % TAGS.length], showTag: index % 3 === 0, firstLeg, length }
})

/** The point `distance` along a trace from its start pad. */
export function pointAlong(trace: Trace, distance: number): Point {
  const [start, bend, end] = trace.points
  if (distance <= trace.firstLeg) {
    const share = trace.firstLeg ? distance / trace.firstLeg : 0
    return [start[0] + (bend[0] - start[0]) * share, start[1] + (bend[1] - start[1]) * share]
  }
  const share = (distance - trace.firstLeg) / (trace.length - trace.firstLeg)
  return [bend[0] + (end[0] - bend[0]) * share, bend[1] + (end[1] - bend[1]) * share]
}

const PULSE_SPEED = 140
const PULSE_LENGTH = 34

export const circuit: Scene = {
  drawStatic: ({ ctx, theme, palette, px }) => {
    const { rgb, alpha } = palette.line
    ctx.lineWidth = px * 1.4
    ctx.strokeStyle = rgba(rgb, alpha * 2.2)
    ctx.lineJoin = 'round'
    ctx.beginPath()
    for (const { points } of TRACES) {
      ctx.moveTo(...points[0])
      ctx.lineTo(...points[1])
      ctx.lineTo(...points[2])
    }
    ctx.stroke()
    ctx.lineJoin = 'miter'
    for (const trace of TRACES) {
      const [start, bend] = trace.points
      ctx.lineWidth = px * 1.3
      ctx.strokeStyle = rgba(rgb, alpha * 4)
      ctx.beginPath()
      ctx.arc(start[0], start[1], 5, 0, TAU)
      ctx.stroke()
      dot(ctx, bend[0], bend[1], 2.4, rgb, alpha * 4)
      if (!trace.showTag) continue
      const onRight = start[0] > VIRTUAL.centerX
      label(ctx, trace.tag, start[0] + (onRight ? -10 : 10), start[1] - 10, { rgb: INK[theme], alpha: 0.45, size: 9, align: onRight ? 'right' : 'left', spacing: 1, px })
    }
  },
  draw: ({ ctx, time, motion, palette, px }) => {
    TRACES.forEach((trace, index) => {
      for (let pulse = 0; pulse < 2; pulse++) {
        const travelled = (motion ? time * PULSE_SPEED : 300) + index * 97 + pulse * trace.length * 0.5
        const head = travelled % trace.length
        const tail = Math.max(0, head - PULSE_LENGTH)
        const [hx, hy] = pointAlong(trace, head)
        const [tx, ty] = pointAlong(trace, tail)
        const glow = ctx.createLinearGradient(tx, ty, hx, hy)
        glow.addColorStop(0, rgba(palette.accent, 0))
        glow.addColorStop(1, rgba(palette.accent, 0.9))
        ctx.strokeStyle = glow
        ctx.lineWidth = px * 2.2
        ctx.beginPath()
        ctx.moveTo(tx, ty)
        if (tail < trace.firstLeg && head > trace.firstLeg) ctx.lineTo(...trace.points[1])
        ctx.lineTo(hx, hy)
        ctx.stroke()
        dot(ctx, hx, hy, 2.6, palette.accent, 0.95, 10)
      }
    })
  },
}

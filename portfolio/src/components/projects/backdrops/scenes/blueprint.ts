import type { Scene, SceneFrame } from '../backdropTypes'
import { gridLines, INK, label, rgba } from '../drawKit'
import { easeOut, loopAt, TAU } from '../sceneMath'

// CADpractice: a blueprint grid where CAD parts draw themselves, get their
// dimensions, and a crosshair cursor moves between them.

type Segment = readonly [x1: number, y1: number, x2: number, y2: number]

export interface Part {
  readonly segments: readonly Segment[]
  /** Dimension line from (x1, y1) to (x2, y2), with its text. */
  readonly dimension: readonly [number, number, number, number, string]
  /** Radius dimensions get one arrowhead, at the rim. */
  readonly radial?: boolean
  /** Seconds this part's loop is shifted by. */
  readonly offset: number
}

function ellipsePoints(cx: number, cy: number, rx: number, ry: number, steps = 28): (readonly [number, number])[] {
  return Array.from({ length: steps + 1 }, (_, step) => [cx + rx * Math.cos((step / steps) * TAU), cy + ry * Math.sin((step / steps) * TAU)] as const)
}

function chain(points: readonly (readonly [number, number])[]): Segment[] {
  return points.slice(1).map((point, index) => [...points[index], ...point] as const)
}

function cube(x: number, y: number, size: number, offset: number): Part {
  const k = 0.87 * size
  const top = [[x, y - size], [x + k, y - size / 2], [x, y], [x - k, y - size / 2]] as const
  const bottom = top.map(([a, b]) => [a, b + size] as const)
  const rim = top.map((point, index) => [...point, ...top[(index + 1) % 4]] as const)
  const edges = [1, 2, 3].map((index) => [...top[index], ...bottom[index]] as const)
  const base = [[1, 2], [2, 3]].map(([a, b]) => [...bottom[a], ...bottom[b]] as const)
  return { segments: [...rim, ...edges, ...base], dimension: [x - k, y + size / 2 + 18, x, y + size + 18, `${size}.00`], offset }
}

function cylinder(x: number, y: number, radius: number, height: number, offset: number): Part {
  const segments = [
    ...chain(ellipsePoints(x, y, radius, radius * 0.35)),
    [x - radius, y, x - radius, y + height] as const,
    [x + radius, y, x + radius, y + height] as const,
    // Only the near half of the base shows.
    ...chain(ellipsePoints(x, y + height, radius, radius * 0.35, 14).slice(0, 15)),
  ]
  return { segments, dimension: [x - radius, y - 22, x + radius, y - 22, `Ø ${radius * 2}`], offset }
}

function flange(x: number, y: number, radius: number, offset: number): Part {
  const holes = Array.from({ length: 6 }, (_, hole) => {
    const angle = (hole / 6) * TAU
    return chain(ellipsePoints(x + radius * 0.72 * Math.cos(angle), y + radius * 0.72 * Math.sin(angle), 5, 5, 10))
  }).flat()
  const segments = [
    ...chain(ellipsePoints(x, y, radius, radius)),
    ...chain(ellipsePoints(x, y, radius * 0.42, radius * 0.42, 20)),
    ...holes,
    [x - radius - 10, y, x + radius + 10, y] as const,
    [x, y - radius - 10, x, y + radius + 10] as const,
  ]
  return { segments, dimension: [x, y, x + radius * 0.707, y - radius * 0.707, `R ${radius}`], radial: true, offset }
}

function bracket(x: number, y: number, offset: number): Part {
  const outline = [[x, y], [x + 92, y], [x + 92, y + 14], [x + 16, y + 14], [x + 16, y + 72], [x, y + 72], [x, y]] as const
  const segments = [...chain(outline), ...chain(ellipsePoints(x + 60, y + 7, 4, 4, 10)), ...chain(ellipsePoints(x + 8, y + 46, 4, 4, 10))]
  return { segments, dimension: [x, y - 16, x + 92, y - 16, '92.00'], offset }
}

export const PARTS: readonly Part[] = [cube(760, 140, 64, 0), cylinder(1185, 116, 30, 70, 3.2), flange(905, 792, 56, 6.4), bracket(1288, 752, 9.6)]

/** Where the crosshair pauses: on each part in turn. */
export const CURSOR_STOPS: readonly (readonly [number, number])[] = [
  [760, 130],
  [1185, 150],
  [905, 792],
  [1334, 785],
]

function drawDimension(frame: SceneFrame, part: Part, fade: number): void {
  const { ctx, theme, palette, px } = frame
  const [x1, y1, x2, y2, text] = part.dimension
  const angle = Math.atan2(y2 - y1, x2 - x1)
  ctx.lineWidth = px
  ctx.strokeStyle = rgba(palette.line.rgb, palette.line.alpha * 4 * fade)
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  const heads = part.radial ? [[x2, y2, angle + Math.PI]] : [[x1, y1, angle], [x2, y2, angle + Math.PI]]
  for (const [x, y, direction] of heads) {
    for (const side of [0.35, -0.35]) {
      ctx.moveTo(x, y)
      ctx.lineTo(x + 7 * Math.cos(direction + side), y + 7 * Math.sin(direction + side))
    }
  }
  ctx.stroke()
  label(ctx, text, (x1 + x2) / 2, (y1 + y2) / 2 - 5, { rgb: INK[theme], alpha: 0.75 * fade, size: 10, align: 'center', spacing: 1, px })
}

function drawPart(frame: SceneFrame, part: Part): void {
  const { ctx, time, motion, palette, px } = frame
  const { progress, fade } = loopAt(time, motion, { period: 14, build: 3.6, hold: 7, offset: part.offset })
  const drawn = progress * part.segments.length
  ctx.lineWidth = px * 1.5
  ctx.strokeStyle = rgba(palette.accent, 0.75 * fade)
  ctx.beginPath()
  part.segments.forEach(([x1, y1, x2, y2], index) => {
    if (index >= drawn) return
    const share = Math.min(1, drawn - index)
    ctx.moveTo(x1, y1)
    ctx.lineTo(x1 + (x2 - x1) * share, y1 + (y2 - y1) * share)
  })
  ctx.stroke()
  if (progress >= 1) drawDimension(frame, part, fade)
}

function drawCursor(frame: SceneFrame): void {
  const { ctx, time, motion, theme, palette, px } = frame
  const leg = motion ? (time / 3.5) % CURSOR_STOPS.length : 1.6
  const from = Math.floor(leg)
  const share = easeOut((leg - from) * 1.6)
  const [ax, ay] = CURSOR_STOPS[from]
  const [bx, by] = CURSOR_STOPS[(from + 1) % CURSOR_STOPS.length]
  const x = ax + (bx - ax) * share
  const y = ay + (by - ay) * share
  ctx.lineWidth = px
  ctx.strokeStyle = rgba(palette.accent, 0.35)
  ctx.beginPath()
  ctx.moveTo(x - 40, y)
  ctx.lineTo(x + 40, y)
  ctx.moveTo(x, y - 40)
  ctx.lineTo(x, y + 40)
  ctx.stroke()
  ctx.strokeStyle = rgba(palette.accent, 0.8)
  ctx.strokeRect(x - 5, y - 5, 10, 10)
  label(ctx, `X ${(x - 560).toFixed(1)}  Y ${(900 - y).toFixed(1)}`, x + 12, y + 22, { rgb: INK[theme], alpha: 0.55, size: 9, spacing: 1, px })
}

export const blueprint: Scene = {
  drawStatic: ({ ctx, view, palette, px }) => {
    gridLines(ctx, view, 24, palette.line.rgb, palette.line.alpha * 0.55, px)
    gridLines(ctx, view, 120, palette.line.rgb, palette.line.alpha * 1.5, px)
  },
  draw: (frame) => {
    for (const part of PARTS) drawPart(frame, part)
    drawCursor(frame)
  },
}

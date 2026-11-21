import type { Rgb, Scene, SceneFrame } from '../backdropTypes'
import { dot, dotGrid, INK, label, rgba } from '../drawKit'
import { TAU } from '../sceneMath'

// Flinki: athletes tracked by AI, drawn as keypoint skeletons in detection boxes.

export type Point = readonly [x: number, y: number]
type Bone = readonly [from: string, to: string]

export interface Skeleton {
  readonly points: Readonly<Record<string, Point>>
  readonly bones: readonly Bone[]
  /** Cyclists only: the crank centre and how far the cranks have turned. */
  readonly bike?: { readonly crank: Point; readonly turn: number }
  /** Jumpers only: how far below the hip the ground is. */
  readonly ground?: number
}

/** The point `length` from `from`, at `angle` radians from straight down; positive leans forward. */
export function limb(from: Point, angle: number, length: number): Point {
  return [from[0] + length * Math.sin(angle), from[1] + length * Math.cos(angle)]
}

/** Where the middle joint (a knee) goes when two bones reach from `start` to `end`, bending forward. */
export function bendJoint(start: Point, end: Point, upper: number, lower: number): Point {
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const reach = Math.max(1, Math.min(Math.hypot(dx, dy), upper + lower - 0.5))
  const cos = (upper * upper + reach * reach - lower * lower) / (2 * upper * reach)
  const angle = Math.atan2(dy, dx) - Math.acos(Math.max(-1, Math.min(1, cos)))
  return [start[0] + upper * Math.cos(angle), start[1] + upper * Math.sin(angle)]
}

const limbBones = (side: number): Bone[] => [
  ['hip', `knee${side}`],
  [`knee${side}`, `ankle${side}`],
  ['shoulder', `elbow${side}`],
  [`elbow${side}`, `hand${side}`],
]

/** A side-on runner; `phase` moves the stride along. */
export function runnerPose(phase: number): Skeleton {
  const bob = -4 * Math.abs(Math.sin(phase))
  const hip: Point = [0, bob]
  const shoulder: Point = [10, bob - 52]
  const sides = [0, 1].map((side) => {
    const swing = phase + side * Math.PI
    const thigh = 0.65 * Math.sin(swing)
    const knee = limb(hip, thigh, 40)
    // The heel kicks up as the leg swings through.
    const ankle = limb(knee, thigh - (0.15 + 1.4 * Math.max(0, Math.cos(swing))), 40)
    const arm = -0.8 * Math.sin(swing)
    const elbow = limb(shoulder, arm, 26)
    return { [`knee${side}`]: knee, [`ankle${side}`]: ankle, [`elbow${side}`]: elbow, [`hand${side}`]: limb(elbow, arm + 1.5, 24) }
  })
  return {
    points: { head: [16, bob - 68], shoulder, hip, ...sides[0], ...sides[1] },
    bones: [['head', 'shoulder'], ['shoulder', 'hip'], ...limbBones(0), ...limbBones(1)],
  }
}

/** A cyclist pedalling; `phase` turns the cranks. */
export function cyclistPose(phase: number): Skeleton {
  const hip: Point = [0, 0]
  const crank: Point = [14, 46]
  const legs = [0, 1].map((side) => {
    const angle = phase + side * Math.PI
    const pedal: Point = [crank[0] + 15 * Math.cos(angle), crank[1] + 15 * Math.sin(angle)]
    return { [`knee${side}`]: bendJoint(hip, pedal, 36, 36), [`ankle${side}`]: pedal }
  })
  return {
    points: { head: [58, -46], shoulder: [44, -30], hip, elbow: [58, -12], hand: [72, -4], ...legs[0], ...legs[1] },
    bones: [
      ['head', 'shoulder'],
      ['shoulder', 'hip'],
      ['shoulder', 'elbow'],
      ['elbow', 'hand'],
      ['hip', 'knee0'],
      ['knee0', 'ankle0'],
      ['hip', 'knee1'],
      ['knee1', 'ankle1'],
    ],
    bike: { crank, turn: phase },
  }
}

/** A standing jump: crouched, then airborne with the arms thrown up; `phase` runs the cycle. */
export function jumperPose(phase: number): Skeleton {
  const extension = 0.5 + 0.5 * Math.sin(phase)
  const crouch = 1 - extension
  const air = Math.max(0, extension - 0.5) * 2
  const hip: Point = [0, 18 * crouch - 50 * air]
  const shoulder: Point = [hip[0] + 12 * crouch, hip[1] - 52 + 10 * crouch]
  const sides = [-4, 4].map((offset, side) => {
    const knee = limb([hip[0] + offset, hip[1]], 1.1 * crouch, 40)
    const arm = -0.9 + 3.8 * extension + side * 0.15
    const elbow = limb(shoulder, arm, 26)
    return { [`knee${side}`]: knee, [`ankle${side}`]: limb(knee, -0.9 * crouch, 40), [`elbow${side}`]: elbow, [`hand${side}`]: limb(elbow, arm + 0.2, 24) }
  })
  return {
    points: { head: [shoulder[0] + 4 * crouch, shoulder[1] - 16], shoulder, hip, ...sides[0], ...sides[1] },
    bones: [['head', 'shoulder'], ['shoulder', 'hip'], ...limbBones(0), ...limbBones(1)],
    ground: 62,
  }
}

interface Figure {
  readonly pose: (phase: number) => Skeleton
  readonly x: number
  readonly y: number
  readonly size: number
  readonly speed: number
  readonly label: string
  /** Where the label goes: above the box, or beside it. */
  readonly tag: 'top' | 'side'
  readonly stat: (time: number) => string
}

/** A runner and a cyclist above the devices, a jumper below them. */
export const FIGURES: readonly Figure[] = [
  { pose: runnerPose, x: 790, y: 142, size: 1.05, speed: 5.5, label: 'RUN', tag: 'top', stat: (t) => `HR ${158 + Math.round(4 * Math.sin(t * 0.6))} · 4:12 /km` },
  { pose: cyclistPose, x: 1135, y: 120, size: 1, speed: 4, label: 'CYCLE', tag: 'top', stat: (t) => `${88 + Math.round(3 * Math.sin(t * 0.5))} rpm · 312 W` },
  { pose: jumperPose, x: 770, y: 822, size: 0.9, speed: 2.4, label: 'JUMP', tag: 'side', stat: (t) => `AIR ${(0.52 + 0.04 * Math.sin(t * 0.4)).toFixed(2)} s` },
]

const place = (figure: Figure, [x, y]: Point): Point => [figure.x + x * figure.size, figure.y + y * figure.size]

function drawBike(ctx: CanvasRenderingContext2D, skeleton: Skeleton, figure: Figure, rgb: Rgb, alpha: number, width: number): void {
  if (!skeleton.bike) return
  const { crank, turn } = skeleton.bike
  const radius = 26 * figure.size
  const seat: Point = [-2, 6]
  const head: Point = [66, 8]
  const rear: Point = [-32, 56]
  const front: Point = [82, 56]
  ctx.lineWidth = width
  ctx.strokeStyle = rgba(rgb, alpha)
  ctx.beginPath()
  for (const hub of [rear, front]) {
    const [x, y] = place(figure, hub)
    ctx.moveTo(x + radius, y)
    ctx.arc(x, y, radius, 0, TAU)
    for (let spoke = 0; spoke < 3; spoke++) {
      const angle = turn * 0.7 + (spoke * Math.PI) / 3
      ctx.moveTo(x - Math.cos(angle) * radius, y - Math.sin(angle) * radius)
      ctx.lineTo(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius)
    }
  }
  const frame: readonly (readonly [Point, Point])[] = [[rear, crank], [crank, seat], [seat, rear], [seat, head], [head, front], [head, crank], [head, [72, -4]]]
  for (const [from, to] of frame) {
    ctx.moveTo(...place(figure, from))
    ctx.lineTo(...place(figure, to))
  }
  ctx.stroke()
}

function drawDetection(frame: SceneFrame, figure: Figure, points: readonly Point[], index: number): void {
  const { ctx, palette, px, time } = frame
  const xs = points.map((point) => point[0])
  const ys = points.map((point) => point[1])
  const left = Math.min(...xs) - 14
  const top = Math.min(...ys) - 18
  const right = Math.max(...xs) + 14
  const bottom = Math.max(...ys) + 12
  const arm = 12
  ctx.lineWidth = px * 1.3
  ctx.strokeStyle = rgba(palette.line.rgb, palette.line.alpha * 4.5)
  ctx.beginPath()
  for (const [x, y, sx, sy] of [[left, top, 1, 1], [right, top, -1, 1], [left, bottom, 1, -1], [right, bottom, -1, -1]] as const) {
    ctx.moveTo(x + sx * arm, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + sy * arm)
  }
  ctx.stroke()
  // The detector's confidence changes in small steps, like a real one.
  const confidence = (0.95 + 0.04 * (0.5 + 0.5 * Math.sin(Math.floor(time * 1.5) * 1.7 + index))).toFixed(2)
  const tag = { rgb: palette.accent, alpha: 0.85, px }
  const stat = { rgb: INK[frame.theme], alpha: 0.45, size: 10, spacing: 1, px }
  if (figure.tag === 'top') {
    label(ctx, `${figure.label} ${confidence}`, left, top - 8, tag)
    label(ctx, figure.stat(time), right + 10, bottom - 4, stat)
  } else {
    label(ctx, `${figure.label} ${confidence}`, right + 10, top + 12, tag)
    label(ctx, figure.stat(time), right + 10, top + 30, stat)
  }
}

function drawFigure(frame: SceneFrame, figure: Figure, index: number): void {
  const { ctx, palette, px, time } = frame
  const skeleton = figure.pose(time * figure.speed + index * 1.3)
  const points = Object.fromEntries(Object.entries(skeleton.points).map(([name, point]) => [name, place(figure, point)]))
  const line = palette.line
  drawBike(ctx, skeleton, figure, line.rgb, line.alpha * 2.2, px)
  if (skeleton.ground !== undefined) {
    const groundY = figure.y + skeleton.ground * figure.size
    ctx.lineWidth = px
    ctx.strokeStyle = rgba(line.rgb, line.alpha * 2.2)
    ctx.beginPath()
    ctx.moveTo(figure.x - 50, groundY)
    ctx.lineTo(figure.x + 60, groundY)
    ctx.stroke()
  }
  ctx.lineWidth = px * 1.7
  ctx.strokeStyle = rgba(line.rgb, line.alpha * 4.2)
  ctx.beginPath()
  for (const [from, to] of skeleton.bones) {
    ctx.moveTo(...points[from])
    ctx.lineTo(...points[to])
  }
  ctx.stroke()
  ctx.lineWidth = px * 1.4
  ctx.beginPath()
  ctx.arc(points.head[0], points.head[1], 8 * figure.size, 0, TAU)
  ctx.stroke()
  for (const [name, [x, y]] of Object.entries(points)) {
    if (name !== 'head') dot(ctx, x, y, 2.6, palette.accent, 0.9, 8)
  }
  drawDetection(frame, figure, Object.values(points), index)
}

export const pose: Scene = {
  drawStatic: ({ ctx, view, palette, px }) => {
    dotGrid(ctx, view, 36, Math.max(1.8, px * 1.3), palette.line.rgb, palette.line.alpha * 0.7)
  },
  draw: (frame) => {
    const { ctx } = frame
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    FIGURES.forEach((figure, index) => drawFigure(frame, figure, index))
    ctx.lineCap = 'butt'
    ctx.lineJoin = 'miter'
  },
}

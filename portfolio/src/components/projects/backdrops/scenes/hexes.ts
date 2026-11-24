import { VIRTUAL } from '../backdropLayout'
import type { Scene, ViewRect } from '../backdropTypes'
import { dot, INK, label, rgba } from '../drawKit'
import { easeOut, loopAt, seededRandom, TAU } from '../sceneMath'

// Talent Management System: a hexagon grid where skill cells light up one by
// one, each showing its level as pips.

export const HEX_RADIUS = 26
const COLUMN_STEP = HEX_RADIUS * 1.5
const ROW_STEP = HEX_RADIUS * Math.sqrt(3)
const ORIGIN_X = 512
const ORIGIN_Y = 10

/** Centre of the hexagon at a lattice column and row; odd columns sit half a row lower. */
export function cellCentre(column: number, row: number): readonly [number, number] {
  return [ORIGIN_X + column * COLUMN_STEP, ORIGIN_Y + row * ROW_STEP + (column % 2 !== 0 ? ROW_STEP / 2 : 0)]
}

/** Every lattice cell whose hexagon reaches into the view. */
export function cellsIn(view: ViewRect): (readonly [number, number])[] {
  const firstColumn = Math.floor((view.left - ORIGIN_X) / COLUMN_STEP) - 1
  const lastColumn = Math.ceil((view.right - ORIGIN_X) / COLUMN_STEP) + 1
  const firstRow = Math.floor((view.top - ORIGIN_Y) / ROW_STEP) - 1
  const lastRow = Math.ceil((view.bottom - ORIGIN_Y) / ROW_STEP) + 1
  const cells: (readonly [number, number])[] = []
  for (let column = firstColumn; column <= lastColumn; column++) {
    for (let row = firstRow; row <= lastRow; row++) cells.push(cellCentre(column, row))
  }
  return cells
}

export interface Skill {
  readonly cell: readonly [number, number]
  readonly name: string
  readonly level: number
}

const NAMES = ['SQL', 'UX', 'QA', 'API', 'PM', 'JS', 'HR', 'BI', 'OPS', 'SEC', 'DATA', 'CX', 'ML', 'PAY', 'LEAD', 'DEV']

/** Skill cells spread around the devices, never behind them or the text. */
export const SKILLS: readonly Skill[] = (() => {
  const random = seededRandom(13)
  const lattice = Array.from({ length: 26 * 22 }, (_, index) => cellCentre(Math.floor(index / 22), index % 22))
  const free = lattice.filter(([x, y]) => {
    const nearDevices = Math.hypot(x - VIRTUAL.centerX, y - VIRTUAL.centerY) < 757
    const behindDevices = x > 600 && x < 1425 && y > 215 && y < 700
    return nearDevices && x > 640 && !behindDevices
  })
  const picked: (readonly [number, number])[] = []
  const pool = [...free]
  while (picked.length < NAMES.length && pool.length > 0) {
    const [cell] = pool.splice(Math.floor(random() * pool.length), 1)
    if (picked.every(([x, y]) => Math.hypot(x - cell[0], y - cell[1]) > HEX_RADIUS * 2.6)) picked.push(cell)
  }
  return picked.map((cell, index) => ({ cell, name: NAMES[index], level: 1 + Math.floor(random() * 5) }))
})()

function hexagon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  for (let corner = 0; corner < 6; corner++) {
    const angle = (corner / 6) * TAU
    const cx = x + radius * Math.cos(angle)
    const cy = y + radius * Math.sin(angle)
    if (corner) ctx.lineTo(cx, cy)
    else ctx.moveTo(cx, cy)
  }
  ctx.closePath()
}

export const hexes: Scene = {
  drawStatic: ({ ctx, view, palette, px }) => {
    ctx.lineWidth = px
    ctx.strokeStyle = rgba(palette.line.rgb, palette.line.alpha * 1.1)
    ctx.beginPath()
    for (const [x, y] of cellsIn(view)) hexagon(ctx, x, y, HEX_RADIUS - 2)
    ctx.stroke()
  },
  draw: ({ ctx, time, motion, theme, palette, px }) => {
    const { fade, local } = loopAt(time, motion, { period: 14, build: 9.5, hold: 2.5 })
    SKILLS.forEach(({ cell: [x, y], name, level }, index) => {
      const lit = easeOut((local - index * 0.55) / 0.6) * fade
      if (lit <= 0) return
      ctx.beginPath()
      hexagon(ctx, x, y, HEX_RADIUS - 2)
      ctx.fillStyle = rgba(palette.accent, 0.16 * lit)
      ctx.fill()
      ctx.lineWidth = px * 1.4
      ctx.strokeStyle = rgba(palette.accent, 0.7 * lit)
      ctx.stroke()
      label(ctx, name, x, y + 2, { rgb: INK[theme], alpha: 0.8 * lit, size: name.length > 3 ? 8 : 10, align: 'center', spacing: 0.5, px })
      for (let pip = 0; pip < 5; pip++) {
        const filled = pip < level
        dot(ctx, x - 10 + pip * 5, y + 11, 1.4, filled ? palette.accent : palette.line.rgb, (filled ? 0.9 : palette.line.alpha * 3) * lit)
      }
    })
  },
}

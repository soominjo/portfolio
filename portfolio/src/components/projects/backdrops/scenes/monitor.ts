import type { Rgb, Scene, SceneFrame } from '../backdropTypes'
import { dot, INK, label, rgba } from '../drawKit'
import { wrap } from '../sceneMath'

// Flux: a bedside-monitor sweep drawing a heartbeat and an oxygen trace, with
// a pulsing heart. Uses `accent2` for the ECG line and `accent` for the heart.

/** Seconds per heartbeat: about 128 beats a minute, a good workout pace. */
export const BEAT = 0.47

const gauss = (at: number, centre: number, width: number, height: number) => height * Math.exp(-((at - centre) ** 2) / (2 * width * width))

/** The ECG at `time` seconds: a small P wave, the tall QRS spike, then the T wave. */
export function ecgAt(time: number): number {
  const at = wrap(time / BEAT, 1)
  return gauss(at, 0.2, 0.03, 0.12) - gauss(at, 0.37, 0.012, 0.15) + gauss(at, 0.42, 0.014, 1) - gauss(at, 0.47, 0.012, 0.28) + gauss(at, 0.68, 0.05, 0.25)
}

/** The oxygen (pleth) wave at `time` seconds: a rounded pulse with a small echo. */
export function plethAt(time: number): number {
  const at = wrap(time / BEAT, 1)
  return 0.9 * Math.exp(-((at - 0.3) ** 2) / 0.008) + 0.3 * Math.exp(-((at - 0.55) ** 2) / 0.004)
}

const LEFT = 560
const SPAN = 880
/** Sweep speed, virtual units a second. */
const SPEED = 210
const STEP = 4
// The sweep erases just ahead of itself, like a real monitor.
const GAP_SECONDS = SPAN / SPEED - 0.28

interface Trace {
  readonly y: number
  readonly height: number
  readonly signal: (time: number) => number
  readonly name: string
}

const TRACES: readonly Trace[] = [
  { y: 140, height: 48, signal: ecgAt, name: 'ECG · II' },
  { y: 800, height: 36, signal: plethAt, name: 'SpO₂ · PLETH' },
]

function drawTrace(frame: SceneFrame, trace: Trace, rgb: Rgb, strength: (age: number) => number): void {
  const { ctx, time, px, theme } = frame
  label(ctx, trace.name, 600, trace.y - trace.height - 18, { rgb: INK[theme], alpha: 0.4, size: 10, spacing: 2, px })
  ctx.lineWidth = px * 1.6
  for (let x = LEFT + STEP; x < LEFT + SPAN; x += STEP) {
    const age = wrap(time * SPEED - (x - LEFT), SPAN) / SPEED
    if (age > GAP_SECONDS) continue
    ctx.strokeStyle = rgba(rgb, strength(age))
    ctx.beginPath()
    ctx.moveTo(x - STEP, trace.y - trace.height * trace.signal(time - age - STEP / SPEED))
    ctx.lineTo(x, trace.y - trace.height * trace.signal(time - age))
    ctx.stroke()
  }
}

export const monitor: Scene = {
  draw: (frame) => {
    const { ctx, time, theme, palette, px } = frame
    const ecgRgb = palette.accent2 ?? palette.accent
    const [ecg, pleth] = TRACES
    drawTrace(frame, ecg, ecgRgb, (age) => 0.75 * Math.exp(-age / 2.4))
    drawTrace(frame, pleth, palette.line.rgb, (age) => palette.line.alpha * 4.5 * Math.exp(-age / 2.4))
    const headX = LEFT + wrap(time * SPEED, SPAN)
    dot(ctx, headX, ecg.y - ecg.height * ecg.signal(time), 3.5, ecgRgb, 0.95, 16)
    dot(ctx, headX, pleth.y - pleth.height * pleth.signal(time), 3.5, ecgRgb, 0.95, 16)
    const beat = Math.max(0, ecgAt(time))
    ctx.font = `${22 + 8 * beat}px "Segoe UI Symbol", sans-serif`
    ctx.textAlign = 'center'
    ctx.fillStyle = rgba(palette.accent, 0.55 + 0.45 * beat)
    ctx.fillText('♥︎', 1306, 86)
    ctx.textAlign = 'start'
    const ink = INK[theme]
    label(ctx, `${128 + Math.round(2 * Math.sin(time * 0.3))} BPM`, 1326, 86, { rgb: ink, alpha: 0.7, size: 14, px })
    label(ctx, 'SpO₂ 98%', 1300, 744, { rgb: ink, alpha: 0.55, size: 12, px })
  },
}

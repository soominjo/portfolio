export interface SpringConfig {
  readonly stiffness: number
  readonly damping: number
  readonly mass: number
}

export interface SpringState {
  readonly value: number
  readonly velocity: number
}

// Small fixed substeps keep stiff springs stable; a stalled tab's huge frame
// gap is capped so the animation resumes instead of jumping.
const MAX_SUBSTEP_SECONDS = 1 / 120
const MAX_FRAME_SECONDS = 0.1
const SETTLE_EPSILON = 1e-3

/** Advances a damped spring toward `target` (semi-implicit Euler). Returns a new state. */
export function stepSpring(state: SpringState, target: number, config: SpringConfig, dtSeconds: number): SpringState {
  const frame = Math.min(Math.max(dtSeconds, 0), MAX_FRAME_SECONDS)
  const steps = Math.max(1, Math.ceil(frame / MAX_SUBSTEP_SECONDS))
  const h = frame / steps
  let { value, velocity } = state
  for (let i = 0; i < steps; i++) {
    const force = -config.stiffness * (value - target) - config.damping * velocity
    velocity += (force / config.mass) * h
    value += velocity * h
  }
  return { value, velocity }
}

/** True once the spring is on its target and has stopped. */
export function isSettled(state: SpringState, target: number, epsilon: number = SETTLE_EPSILON): boolean {
  return Math.abs(state.value - target) < epsilon && Math.abs(state.velocity) < epsilon
}

export function clamp01(t: number): number {
  return Math.min(1, Math.max(0, t))
}

export function easeInOutCubic(t: number): number {
  const x = clamp01(t)
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}

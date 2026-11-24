export const TAU = Math.PI * 2

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

/** Ease-out cubic over 0..1: quick start, gentle landing. */
export function easeOut(value: number): number {
  return 1 - Math.pow(1 - clamp01(value), 3)
}

/** 0..1 sine wave. */
export function wave(angle: number): number {
  return 0.5 + 0.5 * Math.sin(angle)
}

/** Small seeded random generator (mulberry32), so scenes look the same on every visit. */
export function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state)
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
  }
}

export interface LoopTiming {
  /** Seconds the whole loop takes. */
  readonly period: number
  /** Seconds spent drawing in. */
  readonly build: number
  /** Seconds held fully drawn before fading out. */
  readonly hold: number
  /** Shifts this loop against others, in seconds. */
  readonly offset?: number
}

export interface LoopState {
  /** 0..1 through the build. */
  readonly progress: number
  /** 1 while shown, falling to 0 as the loop fades out. */
  readonly fade: number
  /** Seconds into the current loop. */
  readonly local: number
}

/**
 * Where a draw-in, hold, fade-out loop is at `time`. Without motion it is
 * fully drawn and held, so still frames show the finished picture.
 */
export function loopAt(time: number, motion: boolean, timing: LoopTiming): LoopState {
  const { period, build, hold, offset = 0 } = timing
  const local = motion ? (((time + offset) % period) + period) % period : build + hold / 2
  const fadeSpan = period - build - hold
  const fade = local < build + hold ? 1 : clamp01(1 - (local - build - hold) / fadeSpan)
  return { progress: clamp01(local / build), fade, local }
}

/** Positive remainder, for wrapping positions and phases. */
export function wrap(value: number, span: number): number {
  return ((value % span) + span) % span
}

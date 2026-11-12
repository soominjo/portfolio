import { GLYPHS } from '../motion/decoder'

/** How many scrambling characters run ahead of the settled text. */
export const DECODE_FRONTIER = 10

const MS_PER_CHAR = 15
const MIN_DURATION_MS = 600
// However long the reply, it finishes decoding within two seconds.
const MAX_DURATION_MS = 2000
const EASE_POWER = 1.6
const WHITESPACE = /\s/

export interface DecodeFrame {
  readonly settled: string
  readonly scrambled: string
  readonly hidden: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function getDecodeDuration(totalChars: number): number {
  return clamp(totalChars * MS_PER_CHAR, MIN_DURATION_MS, MAX_DURATION_MS)
}

/** Characters settled so far, easing out; ends past the text so the frontier leaves it. */
export function getRevealedCount(elapsedMs: number, durationMs: number, totalChars: number): number {
  const progress = clamp(elapsedMs / durationMs, 0, 1)
  return (totalChars + DECODE_FRONTIER) * (1 - (1 - progress) ** EASE_POWER)
}

/**
 * One frame of one text node: real characters up to `revealed`, a frontier of
 * the hero's code glyphs after them, then the rest, which the caller keeps
 * invisible so the final layout is reserved.
 */
export function decodeFrame(text: string, revealed: number, random: () => number = Math.random): DecodeFrame {
  const position = Math.floor(revealed)
  const settledEnd = clamp(position, 0, text.length)
  const frontierEnd = clamp(position + DECODE_FRONTIER, 0, text.length)
  const scrambled = Array.from(text.slice(settledEnd, frontierEnd), (char) =>
    WHITESPACE.test(char) ? char : GLYPHS[Math.floor(random() * GLYPHS.length)],
  ).join('')

  return {
    settled: text.slice(0, settledEnd),
    scrambled,
    hidden: text.slice(frontierEnd),
  }
}

/** Rough visible length of a Markdown reply, for timing only. */
export function countDecodableChars(markdown: string): number {
  return markdown
    .replace(/\*\*|__|`/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '').length
}

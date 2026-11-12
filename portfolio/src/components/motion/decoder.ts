// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.

export type CharType = 'glyph' | 'value'

export interface DecoderChar {
  readonly type: CharType
  readonly value: string
}

// What a scrambled line of code is made of: brackets, operators and hex digits.
// prettier-ignore
export const GLYPHS: readonly string[] = [
  '{', '}', '[', ']', '(', ')', '<', '>',
  '/', '\\', '=', '+', '-', '*', '&', '|',
  '!', '?', ';', ':', '#', '$', '%', '_',
  '~', '^', '@',
  '0', '1', '2', '3', '4', '5', '6', '7',
  '8', '9', 'A', 'B', 'C', 'D', 'E', 'F',
]

function randomGlyph(random: () => number): string {
  return GLYPHS[Math.floor(random() * GLYPHS.length)]
}

/**
 * One frame of the decode. Characters before `position` show their real value
 * and the rest show code characters. Glyphs re-roll during the first half of each
 * step and hold during the second half, which gives the flicker its rhythm.
 */
export function shuffle(
  content: readonly string[],
  previous: readonly DecoderChar[],
  position: number,
  random: () => number = Math.random,
): DecoderChar[] {
  return content.map((value, index): DecoderChar => {
    if (index < position || value === ' ') {
      return { type: 'value', value }
    }

    const held = previous[index]
    if (position % 1 < 0.5 || held === undefined) {
      return { type: 'glyph', value: randomGlyph(random) }
    }

    return { type: 'glyph', value: held.value }
  })
}

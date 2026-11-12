import { describe, expect, it } from 'vitest'
import { GLYPHS, shuffle } from './decoder'

// Always picks GLYPHS[0] so glyph positions are deterministic.
const random = (): number => 0
const FIRST_GLYPH = GLYPHS[0]

describe('GLYPHS', () => {
  it('scrambles with code characters instead of katakana', () => {
    expect(GLYPHS).toEqual(expect.arrayContaining(['{', '}', '<', '>', '/', ';', '0', '1', 'F']))
    expect(GLYPHS.some((glyph) => /[぀-ヿ]/.test(glyph))).toBe(false)
  })
})

describe('shuffle', () => {
  it('reveals characters before the position as their real values', () => {
    expect(shuffle([...'Gen'], [], 1.2, random)).toEqual([
      { type: 'value', value: 'G' },
      { type: 'value', value: 'e' },
      { type: 'glyph', value: FIRST_GLYPH },
    ])
  })

  it('keeps the previous glyph while the fractional position is 0.5 or more', () => {
    const previous = [
      { type: 'glyph', value: '{' },
      { type: 'glyph', value: '#' },
      { type: 'glyph', value: '%' },
    ] as const
    expect(shuffle([...'Gen'], previous, 0.6, random)).toEqual([
      { type: 'value', value: 'G' },
      { type: 'glyph', value: '#' },
      { type: 'glyph', value: '%' },
    ])
  })

  it('keeps spaces as spaces', () => {
    expect(shuffle([...'a b'], [], 0, random)[1]).toEqual({ type: 'value', value: ' ' })
  })

  it('falls back to a random glyph when there is no previous glyph', () => {
    expect(shuffle([...'ab'], [], 0.5, random)[1]).toEqual({ type: 'glyph', value: FIRST_GLYPH })
  })

  it('only ever uses characters from GLYPHS', () => {
    expect(shuffle([...'Contreras'], [], 0).every((c) => GLYPHS.includes(c.value))).toBe(true)
  })
})

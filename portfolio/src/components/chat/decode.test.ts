import { describe, expect, it } from 'vitest'
import { GLYPHS } from '../motion/decoder'
import { countDecodableChars, decodeFrame, getDecodeDuration, getRevealedCount } from './decode'

describe('getDecodeDuration', () => {
  it.each([
    [10, 600],
    [80, 1200],
    [500, 2000],
    [5000, 2000],
  ])('caps the decode at two seconds (%i chars → %i ms)', (chars, ms) => {
    expect(getDecodeDuration(chars)).toBe(ms)
  })
})

describe('getRevealedCount', () => {
  it('reveals nothing at the start and everything, frontier included, at the end', () => {
    expect(getRevealedCount(0, 2000, 100)).toBe(0)
    expect(getRevealedCount(2000, 2000, 100)).toBe(110)
    expect(getRevealedCount(9999, 2000, 100)).toBe(110)
  })

  it('eases out', () => {
    expect(getRevealedCount(1000, 2000, 100)).toBeCloseTo(73.71, 1)
  })
})

describe('decodeFrame', () => {
  it('settles, scrambles a frontier of ten and hides the rest', () => {
    expect(decodeFrame('The quick brown fox', 4, () => 0)).toEqual({
      settled: 'The ',
      scrambled: '{{{{{ {{{{',
      hidden: 'n fox',
    })
  })

  it('starts a later text node part-way into the frontier', () => {
    expect(decodeFrame('abc def', -8, () => 0)).toEqual({ settled: '', scrambled: '{{', hidden: 'c def' })
  })

  it('shows a finished text node as is', () => {
    expect(decodeFrame('abc', 12)).toEqual({ settled: 'abc', scrambled: '', hidden: '' })
  })

  it('scrambles only with the hero glyphs', () => {
    const { scrambled } = decodeFrame('Contreras builds', 0)
    expect([...scrambled].every((c) => c === ' ' || GLYPHS.includes(c))).toBe(true)
  })
})

describe('countDecodableChars', () => {
  it.each([
    ['Hi **there**', 8],
    ['- one\n- two', 7],
    ['## Title', 5],
  ])('estimates the visible length of %j', (markdown, length) => {
    expect(countDecodableChars(markdown)).toBe(length)
  })
})

import { describe, expect, it } from 'vitest'
import { contrastRatio, mixHex, normalizeHex, readableOn } from './brandColor'

// The tile and text colours the tech stack uses (see skillModel.ts).
const DARK_TILE = '#0e121b'
const DARK_FG = '#e2e8f0'
const LIGHT_TILE = '#f8fafc'
const LIGHT_FG = '#1e293b'

describe('normalizeHex', () => {
  it('accepts six hex digits with or without a leading #', () => {
    expect(normalizeHex('61DAFB')).toBe('#61dafb')
    expect(normalizeHex('#61DAFB')).toBe('#61dafb')
  })

  it('rejects anything that is not six hex digits', () => {
    expect(() => normalizeHex('fff')).toThrow(/hex colour/)
    expect(() => normalizeHex('#GGGGGG')).toThrow(/hex colour/)
    expect(() => normalizeHex('')).toThrow(/hex colour/)
  })
})

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('is 1 for a colour against itself', () => {
    expect(contrastRatio('#3178c6', '#3178c6')).toBeCloseTo(1, 5)
  })

  it('does not depend on argument order', () => {
    expect(contrastRatio('#3178c6', DARK_TILE)).toBeCloseTo(contrastRatio(DARK_TILE, '#3178c6'), 10)
  })
})

describe('mixHex', () => {
  it('returns each end colour at 0 and 1', () => {
    expect(mixHex('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mixHex('#000000', '#ffffff', 1)).toBe('#ffffff')
  })

  it('blends the channels in between', () => {
    expect(mixHex('#000000', '#ffffff', 0.5)).toBe('#808080')
  })

  it('clamps the amount to 0..1', () => {
    expect(mixHex('#000000', '#ffffff', -1)).toBe('#000000')
    expect(mixHex('#000000', '#ffffff', 2)).toBe('#ffffff')
  })
})

describe('readableOn', () => {
  it('keeps a brand colour that already contrasts with the tile', () => {
    expect(readableOn('3178C6', DARK_TILE, DARK_FG)).toBe('#3178c6') // TypeScript
  })

  it('swaps black and grey marks for the foreground colour', () => {
    expect(readableOn('000000', DARK_TILE, DARK_FG)).toBe(DARK_FG) // Next.js, Vercel
    expect(readableOn('181717', DARK_TILE, DARK_FG)).toBe(DARK_FG) // GitHub
  })

  it('lifts a dark brand colour on a dark tile just enough to read', () => {
    const flutter = readableOn('02569B', DARK_TILE, DARK_FG)
    expect(flutter).not.toBe('#02569b')
    expect(flutter).not.toBe(DARK_FG)
    expect(contrastRatio(flutter, DARK_TILE)).toBeGreaterThanOrEqual(3)
  })

  it('deepens a pale brand colour on a light tile just enough to read', () => {
    const react = readableOn('61DAFB', LIGHT_TILE, LIGHT_FG)
    expect(react).not.toBe('#61dafb')
    expect(react).not.toBe(LIGHT_FG)
    expect(contrastRatio(react, LIGHT_TILE)).toBeGreaterThanOrEqual(3)
  })

  it('honours a stricter ratio', () => {
    const typescript = readableOn('3178C6', DARK_TILE, DARK_FG, 4.5)
    expect(contrastRatio(typescript, DARK_TILE)).toBeGreaterThanOrEqual(4.5)
  })

  it('falls back to the foreground when no blend reaches the ratio', () => {
    expect(readableOn('ff0000', '#808080', '#7f7f7f')).toBe('#7f7f7f')
  })
})

import { describe, expect, it } from 'vitest'
import {
  BACKGROUND_OPTIONS,
  DEFAULT_BACKGROUND,
  isBackgroundLabEnabled,
  parseBackgroundId,
  withBackgroundParam,
} from './backgroundLab'

describe('BACKGROUND_OPTIONS', () => {
  it('starts with the galaxy, which is the default', () => {
    expect(BACKGROUND_OPTIONS[0].id).toBe('galaxy')
    expect(DEFAULT_BACKGROUND).toBe('galaxy')
  })

  it('has unique ids', () => {
    const ids = BACKGROUND_OPTIONS.map((option) => option.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('parseBackgroundId', () => {
  it('reads a known background from the query string', () => {
    expect(parseBackgroundId('?bg=sphere')).toBe('sphere')
    expect(parseBackgroundId('?utm=x&bg=grid-scan')).toBe('grid-scan')
  })

  it('falls back to the galaxy when the param is missing or unknown', () => {
    expect(parseBackgroundId('')).toBe('galaxy')
    expect(parseBackgroundId('?bg=nope')).toBe('galaxy')
  })
})

describe('withBackgroundParam', () => {
  it('sets the background and keeps other params', () => {
    expect(withBackgroundParam('?utm=x', 'sphere')).toBe('?utm=x&bg=sphere')
    expect(withBackgroundParam('?bg=orb', 'particles')).toBe('?bg=particles')
  })

  it('drops the param for the default background', () => {
    expect(withBackgroundParam('?bg=sphere&utm=x', 'galaxy')).toBe('?utm=x')
    expect(withBackgroundParam('?bg=sphere', 'galaxy')).toBe('')
  })
})

describe('isBackgroundLabEnabled', () => {
  it('is on in development', () => {
    expect(isBackgroundLabEnabled({ DEV: true })).toBe(true)
  })

  it('is on for builds made with VITE_BG_LAB=1', () => {
    expect(isBackgroundLabEnabled({ DEV: false, VITE_BG_LAB: '1' })).toBe(true)
  })

  it('is off in a normal production build', () => {
    expect(isBackgroundLabEnabled({ DEV: false })).toBe(false)
    expect(isBackgroundLabEnabled({ DEV: false, VITE_BG_LAB: '0' })).toBe(false)
  })
})

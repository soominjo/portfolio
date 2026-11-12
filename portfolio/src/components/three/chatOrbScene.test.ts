import { describe, expect, it, vi } from 'vitest'
import { createChatOrbScene, getOrbLean, getOrbLightIntensities } from './chatOrbScene'

describe('getOrbLightIntensities', () => {
  it('lights the orb a little brighter than the hero in the dark theme', () => {
    expect(getOrbLightIntensities('dark')).toEqual({ directional: 2.6, ambient: 1.1 })
    expect(getOrbLightIntensities('light')).toEqual({ directional: 1.8, ambient: 2.7 })
  })
})

describe('getOrbLean', () => {
  const center = { x: 1000, y: 800 }

  it('stays upright when the pointer is on the orb', () => {
    expect(getOrbLean(center, center)).toEqual({ x: 0, y: 0 })
  })

  it('leans in proportion within 260px', () => {
    expect(getOrbLean({ x: 870, y: 930 }, center)).toEqual({ x: -0.5, y: 0.5 })
  })

  it('caps the lean at 1', () => {
    expect(getOrbLean({ x: 1300, y: 800 }, center)).toEqual({ x: 1, y: 0 })
  })

  it('ignores pointers more than 400px away', () => {
    expect(getOrbLean({ x: 0, y: 0 }, center)).toEqual({ x: 0, y: 0 })
  })
})

describe('createChatOrbScene', () => {
  it('returns null when WebGL is unavailable', () => {
    // three logs its own context-creation error before throwing; keep the run quiet.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(createChatOrbScene(document.createElement('canvas'))).toBeNull()
    vi.restoreAllMocks()
  })
})

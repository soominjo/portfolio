import { describe, expect, it, vi } from 'vitest'
import { createSphereScene, getLightIntensities, getSpherePosition } from './sphereScene'

describe('getSpherePosition', () => {
  it.each([
    [360, 14, 10],
    [767, 14, 10],
    [768, 18, 14],
    [1023, 18, 14],
    [1024, 22, 16],
    [1920, 22, 16],
  ])('positions the sphere for a %ipx viewport', (width, x, y) => {
    expect(getSpherePosition(width)).toEqual({ x, y })
  })
})

describe('getLightIntensities', () => {
  it('uses brighter ambient light in the light theme', () => {
    expect(getLightIntensities('dark')).toEqual({ directional: 2, ambient: 0.4 })
    expect(getLightIntensities('light')).toEqual({ directional: 1.8, ambient: 2.7 })
  })
})

describe('createSphereScene', () => {
  it('returns null when WebGL is unavailable', () => {
    // three logs its own context-creation error before throwing; keep the run quiet.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(createSphereScene(document.createElement('canvas'))).toBeNull()
    vi.restoreAllMocks()
  })
})

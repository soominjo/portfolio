import { describe, expect, it } from 'vitest'
import { createShadowTexture } from './shadowTexture'

describe('createShadowTexture', () => {
  const size = 64
  const texture = createShadowTexture(size)
  const pixels = texture.image.data as Uint8Array
  const alphaAt = (x: number, y: number) => pixels[(y * size + x) * 4 + 3]

  it('is darkest in the middle and fades out by the edge', () => {
    expect(alphaAt(32, 32)).toBeGreaterThan(200)
    expect(alphaAt(48, 32)).toBeLessThan(alphaAt(40, 32))
    expect(alphaAt(0, 0)).toBe(0)
    expect(alphaAt(63, 32)).toBe(0)
  })

  it('is pure black', () => {
    expect([pixels[0], pixels[1], pixels[2]]).toEqual([0, 0, 0])
    const centre = (32 * size + 32) * 4
    expect([pixels[centre], pixels[centre + 1], pixels[centre + 2]]).toEqual([0, 0, 0])
  })
})

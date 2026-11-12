import { DataTexture, LinearFilter, RGBAFormat } from 'three'

/**
 * A soft round contact shadow: black, with alpha falling off as (1 - r)²
 * from the centre to the edge. Built from pixels, so it needs no canvas.
 */
export function createShadowTexture(size = 64): DataTexture {
  const data = new Uint8Array(size * size * 4)
  const half = (size - 1) / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = Math.min(1, Math.hypot(x - half, y - half) / half)
      data[(y * size + x) * 4 + 3] = Math.round(255 * (1 - r) ** 2)
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat)
  texture.magFilter = LinearFilter
  texture.minFilter = LinearFilter
  texture.needsUpdate = true
  return texture
}

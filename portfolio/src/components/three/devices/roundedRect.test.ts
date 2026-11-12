import { Box3, BufferAttribute } from 'three'
import { describe, expect, it } from 'vitest'
import { createRoundedPlane, createRoundedSlab } from './roundedRect'

describe('createRoundedPlane', () => {
  it('is centred and sized as asked', () => {
    const geometry = createRoundedPlane(2, 1, 0.1)
    geometry.computeBoundingBox()
    const box = geometry.boundingBox as Box3
    expect(box.min.x).toBeCloseTo(-1)
    expect(box.max.x).toBeCloseTo(1)
    expect(box.min.y).toBeCloseTo(-0.5)
    expect(box.max.y).toBeCloseTo(0.5)
  })

  it('stretches its UVs over the unit square so a texture fills it', () => {
    const uv = createRoundedPlane(2, 1, 0.1).getAttribute('uv') as BufferAttribute
    const us = Array.from({ length: uv.count }, (_, i) => uv.getX(i))
    const vs = Array.from({ length: uv.count }, (_, i) => uv.getY(i))
    expect(Math.min(...us)).toBeCloseTo(0)
    expect(Math.max(...us)).toBeCloseTo(1)
    expect(Math.min(...vs)).toBeCloseTo(0)
    expect(Math.max(...vs)).toBeCloseTo(1)
  })
})

describe('createRoundedSlab', () => {
  it('keeps its bevel inside the asked-for size and depth', () => {
    const geometry = createRoundedSlab(3, 2, 0.14, 0.075)
    geometry.computeBoundingBox()
    const box = geometry.boundingBox as Box3
    expect(box.min.x).toBeCloseTo(-1.5)
    expect(box.max.x).toBeCloseTo(1.5)
    expect(box.min.z).toBeCloseTo(-0.075)
    expect(box.max.z).toBeCloseTo(0)
  })
})

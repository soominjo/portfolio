import { describe, expect, it } from 'vitest'
import { applyFinish, createDeviceMaterials } from './deviceMaterials'
import { FINISHES } from './finishes'

const hex = (color: string) => color.slice(1).toLowerCase()

describe('createDeviceMaterials', () => {
  it('starts in the finish it is given', () => {
    const materials = createDeviceMaterials(FINISHES.black)
    expect(materials.body.color.getHexString()).toBe(hex(FINISHES.black.body))
    expect(materials.keys.color.getHexString()).toBe(hex(FINISHES.black.keys))
    expect(materials.body.metalness).toBe(FINISHES.black.metalness)
  })
})

describe('applyFinish', () => {
  it('shows the starting finish at 0 and the target at 1', () => {
    const materials = createDeviceMaterials(FINISHES.silver)
    applyFinish(materials, FINISHES.silver, FINISHES.black, 0)
    expect(materials.body.color.getHexString()).toBe(hex(FINISHES.silver.body))
    applyFinish(materials, FINISHES.silver, FINISHES.black, 1)
    expect(materials.body.color.getHexString()).toBe(hex(FINISHES.black.body))
    expect(materials.keys.color.getHexString()).toBe(hex(FINISHES.black.keys))
    expect(materials.body.roughness).toBeCloseTo(FINISHES.black.roughness)
  })

  it('blends partway through', () => {
    const materials = createDeviceMaterials(FINISHES.silver)
    applyFinish(materials, FINISHES.silver, FINISHES.black, 0.5)
    expect(materials.body.metalness).toBeCloseTo((FINISHES.silver.metalness + FINISHES.black.metalness) / 2)
    expect([hex(FINISHES.silver.body), hex(FINISHES.black.body)]).not.toContain(materials.body.color.getHexString())
  })

  it('keeps the trackpad the same colour as the body', () => {
    const materials = createDeviceMaterials(FINISHES.silver)
    applyFinish(materials, FINISHES.silver, FINISHES.white, 1)
    expect(materials.pad.color.getHexString()).toBe(materials.body.color.getHexString())
  })
})

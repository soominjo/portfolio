import { Box3, type BufferGeometry, type Mesh } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { createDeviceMaterials } from './deviceMaterials'
import { FINISHES } from './finishes'
import { createLaptop, LID_CLOSED, LID_OPEN } from './laptopModel'
import { createPhone } from './phoneModel'

const materials = createDeviceMaterials(FINISHES.silver)

function worldBox(object: Parameters<Box3['setFromObject']>[0]): Box3 {
  object.updateWorldMatrix(true, true)
  return new Box3().setFromObject(object)
}

function geometriesOf(object: Parameters<Box3['setFromObject']>[0]): BufferGeometry[] {
  const found = new Set<BufferGeometry>()
  object.traverse((child) => {
    if ((child as Mesh).isMesh) found.add((child as Mesh).geometry)
  })
  return [...found]
}

describe('createLaptop', () => {
  it('hinges the lid at the back of the base', () => {
    const { lid } = createLaptop(materials)
    expect(lid.position.x).toBeCloseTo(0)
    expect(lid.position.y).toBeCloseTo(0.075)
    expect(lid.position.z).toBeCloseTo(-1.025)
  })

  it('starts closed, with the lid lying flat on the base', () => {
    const { group, lid } = createLaptop(materials)
    expect(lid.rotation.x).toBe(LID_CLOSED)
    expect(worldBox(group).max.y).toBeLessThan(0.15)
  })

  it('stands the lid up when opened', () => {
    const { group, lid } = createLaptop(materials)
    lid.rotation.x = LID_OPEN
    expect(worldBox(lid).max.y).toBeGreaterThan(1.9)
    expect(worldBox(group).min.y).toBeCloseTo(0, 2)
  })

  it('names the parts the scene animates', () => {
    const { group } = createLaptop(materials)
    expect(group.name).toBe('laptop')
    expect(group.getObjectByName('laptop-lid')).toBeDefined()
    expect(group.getObjectByName('laptop-screen-base')).toBeDefined()
  })

  it('has a 16:10 screen', () => {
    expect(createLaptop(materials).screenAspect).toBeCloseTo(1.6)
  })

  it('disposes its geometry', () => {
    const laptop = createLaptop(materials)
    const spies = geometriesOf(laptop.group).map((geometry) => vi.spyOn(geometry, 'dispose'))
    laptop.dispose()
    for (const spy of spies) expect(spy).toHaveBeenCalled()
  })
})

describe('createPhone', () => {
  it('stands upright on the ground', () => {
    const box = worldBox(createPhone(materials).group)
    expect(box.min.y).toBeCloseTo(0, 1)
    expect(box.max.y - box.min.y).toBeGreaterThan(1.49)
    expect(box.max.y - box.min.y).toBeLessThan(1.55)
  })

  it('has a screen shaped like a modern phone', () => {
    expect(createPhone(materials).screenAspect).toBeCloseTo(0.466, 2)
  })

  it('names the parts the scene animates', () => {
    const { group } = createPhone(materials)
    expect(group.name).toBe('phone')
    expect(group.getObjectByName('phone-screen-base')).toBeDefined()
  })

  it('disposes its geometry', () => {
    const phone = createPhone(materials)
    const spies = geometriesOf(phone.group).map((geometry) => vi.spyOn(geometry, 'dispose'))
    phone.dispose()
    for (const spy of spies) expect(spy).toHaveBeenCalled()
  })
})

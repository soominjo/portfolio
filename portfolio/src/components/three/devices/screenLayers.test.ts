import { Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { createScreenLayers, type ScreenLayers } from './screenLayers'

type LayerMesh = Mesh<PlaneGeometry, MeshBasicMaterial>

function layer(layers: ScreenLayers, which: 'base' | 'top'): LayerMesh {
  return layers.group.getObjectByName(`screen-${which}`) as LayerMesh
}

describe('createScreenLayers', () => {
  const geometry = new PlaneGeometry(1.6, 1)

  it('starts dark, showing nothing', () => {
    const layers = createScreenLayers(geometry, 'screen')
    expect(layers.displayed()).toEqual([])
    expect(layer(layers, 'base').visible).toBe(false)
  })

  it('puts the first texture straight on the base', () => {
    const layers = createScreenLayers(geometry, 'screen')
    const first = new Texture()
    layers.show(first)
    expect(layers.displayed()).toEqual([first])
    expect(layer(layers, 'base').material.map).toBe(first)
    expect(layer(layers, 'base').material.opacity).toBe(1)
    expect(layer(layers, 'base').visible).toBe(true)
  })

  it('fades a new texture in over the old one', () => {
    const layers = createScreenLayers(geometry, 'screen')
    const [first, second] = [new Texture(), new Texture()]
    layers.show(first)
    layers.show(second)
    expect(layer(layers, 'top').material.map).toBe(second)
    expect(layer(layers, 'top').material.opacity).toBe(0)
    layers.setFade(0.4)
    expect(layer(layers, 'top').material.opacity).toBeCloseTo(0.4)
    expect(layers.displayed()).toEqual([first, second])
  })

  it('commits the faded texture to the base', () => {
    const layers = createScreenLayers(geometry, 'screen')
    const [first, second] = [new Texture(), new Texture()]
    layers.show(first)
    layers.show(second)
    layers.setFade(1)
    layers.commit()
    expect(layers.displayed()).toEqual([second])
    expect(layer(layers, 'base').material.map).toBe(second)
    expect(layer(layers, 'top').material.map).toBeNull()
    expect(layer(layers, 'top').visible).toBe(false)
  })

  it('draws unlit and untoned so screenshots keep their colours', () => {
    const material = layer(createScreenLayers(geometry, 'screen'), 'base').material
    expect(material).toBeInstanceOf(MeshBasicMaterial)
    expect(material.toneMapped).toBe(false)
  })

  it('disposes its materials but not the shared geometry', () => {
    const layers = createScreenLayers(geometry, 'screen')
    const disposeMaterial = vi.spyOn(layer(layers, 'base').material, 'dispose')
    const disposeGeometry = vi.spyOn(geometry, 'dispose')
    layers.dispose()
    expect(disposeMaterial).toHaveBeenCalled()
    expect(disposeGeometry).not.toHaveBeenCalled()
  })
})

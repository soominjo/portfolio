import { Texture, type Camera, type Group, type Mesh, type MeshBasicMaterial, type MeshPhysicalMaterial } from 'three'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { createDeviceScene, type DeviceScene } from './deviceScene'
import type { DeviceSlide } from './deviceTypes'
import { FINISHES } from './finishes'
import { LID_CLOSED, LID_OPEN } from './laptopModel'

interface FakeRenderer {
  setSize: Mock
  render: Mock
  dispose: Mock
}

const control = vi.hoisted(() => ({ renderers: [] as FakeRenderer[], failRenderer: false }))

// Everything in three stays real except the renderer, which needs WebGL.
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  class FakeWebGLRenderer {
    outputColorSpace = ''
    toneMapping = 0
    capabilities = { getMaxAnisotropy: () => 8 }
    setSize = vi.fn()
    setPixelRatio = vi.fn()
    render = vi.fn()
    dispose = vi.fn()
    initTexture = vi.fn()
    constructor() {
      if (control.failRenderer) throw new Error('WebGL unavailable')
      control.renderers.push(this)
    }
  }
  return { ...actual, WebGLRenderer: FakeWebGLRenderer }
})

interface Deferred {
  promise: Promise<Texture>
  resolve: (texture: Texture) => void
  reject: (error: Error) => void
}

function deferred(): Deferred {
  let resolve: Deferred['resolve'] = () => {}
  let reject: Deferred['reject'] = () => {}
  const promise = new Promise<Texture>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function screenshot(width = 1440, height = 713): Texture {
  const texture = new Texture()
  texture.image = { width, height }
  vi.spyOn(texture, 'dispose')
  return texture
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const ALPHA: DeviceSlide = {
  id: 'alpha',
  label: 'Alpha',
  desktopUrl: '/alpha.webp',
  mobileUrl: '/alpha-mobile.webp',
  showPhone: true,
  finish: 'silver',
  desktopFocusX: 0.5,
}
const BETA: DeviceSlide = {
  id: 'beta',
  label: 'Beta',
  desktopUrl: '/beta.webp',
  mobileUrl: null,
  showPhone: false,
  finish: 'black',
  desktopFocusX: 0.5,
}

function setup() {
  const loads = new Map<string, Deferred>()
  const loadTexture = vi.fn((url: string) => {
    const pending = deferred()
    loads.set(url, pending)
    return pending.promise
  })
  const placeholder = new Texture()
  const createPlaceholder = vi.fn(() => placeholder)
  const onChange = vi.fn()
  const canvas = document.createElement('canvas')
  const scene = createDeviceScene(canvas, { loadTexture, createPlaceholder, onChange }) as DeviceScene
  return { scene, loads, loadTexture, placeholder, createPlaceholder, onChange }
}

/** Steps the scene in 16 ms frames; returns the last update's result. */
function runFor(scene: DeviceScene, ms: number): boolean {
  let moving = true
  for (let now = 0; now <= ms; now += 16) moving = scene.update(now)
  return moving
}

function object<T>(scene: DeviceScene, name: string): T {
  return scene.scene.getObjectByName(name) as T
}

function screenMap(scene: DeviceScene, name: string): Texture | null {
  return object<Mesh<never, MeshBasicMaterial>>(scene, name).material.map
}

describe('createDeviceScene', () => {
  beforeEach(() => {
    control.renderers.length = 0
    control.failRenderer = false
  })

  it('returns null when WebGL is unavailable', () => {
    control.failRenderer = true
    expect(createDeviceScene(document.createElement('canvas'))).toBeNull()
  })

  it('sizes the renderer and camera on resize', () => {
    const { scene } = setup()
    scene.resize(800, 500)
    scene.render()
    const renderer = control.renderers[0]
    expect(renderer.setSize).toHaveBeenCalledWith(800, 500, false)
    const camera = renderer.render.mock.calls[0][1] as Camera & { aspect: number }
    expect(camera.aspect).toBeCloseTo(1.6)
  })

  it('shows the laptop screenshot once it loads', async () => {
    const { scene, loads, onChange } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    onChange.mockClear()
    const alpha = screenshot()
    loads.get('/alpha.webp')?.resolve(alpha)
    await flush()
    expect(screenMap(scene, 'laptop-screen-base')).toBe(alpha)
    expect(onChange).toHaveBeenCalled()
  })

  it('crops a wide screenshot to the laptop screen', async () => {
    const { scene, loads } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    const alpha = screenshot(2000, 1000)
    loads.get('/alpha.webp')?.resolve(alpha)
    await flush()
    expect(alpha.repeat.x).toBeCloseTo(0.8)
    expect(alpha.offset.x).toBeCloseTo(0.1)
  })

  it('crops toward the side the slide asks to keep', async () => {
    const { scene, loads } = setup()
    scene.setSlide({ ...ALPHA, desktopFocusX: 0 }, { immediate: true })
    const alpha = screenshot(2000, 1000)
    loads.get('/alpha.webp')?.resolve(alpha)
    await flush()
    expect(alpha.offset.x).toBe(0)
  })

  it('ignores a texture that resolves after a newer slide', async () => {
    const { scene, loads } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    scene.setSlide({ ...BETA, showPhone: true }, { immediate: true })
    const beta = screenshot()
    loads.get('/beta.webp')?.resolve(beta)
    await flush()
    loads.get('/alpha.webp')?.resolve(screenshot())
    await flush()
    expect(screenMap(scene, 'laptop-screen-base')).toBe(beta)
  })

  it('falls back to the placeholder when a screenshot fails', async () => {
    const { scene, loads, placeholder } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    loads.get('/alpha.webp')?.reject(new Error('404'))
    await flush()
    expect(screenMap(scene, 'laptop-screen-base')).toBe(placeholder)
  })

  it('shows the placeholder on the phone without a mobile screenshot', () => {
    const { scene, placeholder, createPlaceholder } = setup()
    scene.playIntro({ immediate: true })
    scene.setSlide({ ...ALPHA, mobileUrl: null }, { immediate: true })
    expect(screenMap(scene, 'phone-screen-base')).toBe(placeholder)
    expect(createPlaceholder).toHaveBeenCalledWith('Alpha')
  })

  it('cross-fades to the next screenshot instead of cutting', async () => {
    const { scene, loads } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    loads.get('/alpha.webp')?.resolve(screenshot())
    await flush()
    scene.setSlide({ ...BETA, showPhone: true }, { immediate: false })
    const beta = screenshot()
    loads.get('/beta.webp')?.resolve(beta)
    await flush()
    scene.update(0)
    expect(screenMap(scene, 'laptop-screen-top')).toBe(beta)
    runFor(scene, 600)
    expect(screenMap(scene, 'laptop-screen-base')).toBe(beta)
  })

  it('keeps the lid closed and the phone away until the intro plays', () => {
    const { scene } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    runFor(scene, 1000)
    expect(object<Group>(scene, 'laptop-lid').rotation.x).toBe(LID_CLOSED)
    expect(object<Group>(scene, 'phone').visible).toBe(false)
  })

  it('opens the lid on intro and then settles', () => {
    const { scene } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    scene.playIntro({ immediate: false })
    expect(runFor(scene, 3000)).toBe(false)
    expect(object<Group>(scene, 'laptop-lid').rotation.x).toBeCloseTo(LID_OPEN, 2)
    expect(object<Group>(scene, 'phone').visible).toBe(true)
  })

  it('jumps straight to the end state when the intro is immediate', () => {
    const { scene } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    scene.playIntro({ immediate: true })
    scene.update(0)
    expect(object<Group>(scene, 'laptop-lid').rotation.x).toBeCloseTo(LID_OPEN)
    expect(object<Group>(scene, 'phone').visible).toBe(true)
    expect(object<Group>(scene, 'phone').position.y).toBeCloseTo(0)
  })

  it('hides the phone and centres the laptop when the slide has no phone', () => {
    const { scene } = setup()
    scene.playIntro({ immediate: true })
    scene.setSlide(ALPHA, { immediate: true })
    scene.setSlide(BETA, { immediate: false })
    runFor(scene, 2000)
    expect(object<Group>(scene, 'phone').visible).toBe(false)
    expect(object<Group>(scene, 'laptop').position.x).toBeCloseTo(0, 2)
  })

  it('tweens to the new finish', () => {
    const { scene } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    scene.setSlide({ ...ALPHA, id: 'gamma', finish: 'black' }, { immediate: false })
    runFor(scene, 600)
    const body = object<Mesh<never, MeshPhysicalMaterial>>(scene, 'laptop-base').material
    expect(body.color.getHexString()).toBe(FINISHES.black.body.slice(1))
  })

  it('leans toward the pointer', () => {
    const { scene } = setup()
    const rig = object<Group>(scene, 'rig')
    const resting = rig.rotation.y
    scene.setPointer(0.5, 0)
    runFor(scene, 1000)
    expect(rig.rotation.y).toBeGreaterThan(resting + 0.1)
  })

  it('prefetches the screenshots of nearby slides', () => {
    const { scene, loadTexture } = setup()
    scene.prefetch([BETA, ALPHA])
    expect(loadTexture).toHaveBeenCalledWith('/beta.webp')
    expect(loadTexture).toHaveBeenCalledWith('/alpha-mobile.webp')
  })

  it('disposes the renderer and the textures it loaded', async () => {
    const { scene, loads } = setup()
    scene.setSlide(ALPHA, { immediate: true })
    const alpha = screenshot()
    loads.get('/alpha.webp')?.resolve(alpha)
    await flush()
    scene.dispose()
    expect(control.renderers[0].dispose).toHaveBeenCalled()
    expect(alpha.dispose).toHaveBeenCalled()
  })
})

import { PerspectiveCamera, Scene, type Texture } from 'three'
import { createDeviceMotion } from './deviceMotion'
import { createDeviceRig } from './deviceRig'
import type { DeviceSlide } from './deviceTypes'
import { frameDevices } from './framing'
import { createPlaceholderTexture } from './placeholderTexture'
import { addLights, createEnvironment, createRenderer } from './sceneSetup'
import { createScreenFeed } from './screenFeed'
import type { TextureLoadFn } from './textureCache'

export interface DeviceSceneOptions {
  readonly loadTexture?: TextureLoadFn
  readonly createPlaceholder?: (label: string) => Texture
  /** Called whenever the scene needs drawing again, e.g. a screenshot arrived. */
  readonly onChange?: () => void
}

/** The showcase's laptop and phone, framework-free: the caller drives frames. */
export interface DeviceScene {
  readonly scene: Scene
  resize(width: number, height: number): void
  setSlide(slide: DeviceSlide, options: { readonly immediate: boolean }): void
  /** Starts loading screenshots that are likely next. */
  prefetch(slides: readonly DeviceSlide[]): void
  /** Lid swings open and the phone springs up, once. */
  playIntro(options: { readonly immediate: boolean }): void
  /** Pointer position across the window, each axis -0.5..0.5. */
  setPointer(x: number, y: number): void
  /** Advances animations to `nowMs`; true while anything still moves. */
  update(nowMs: number): boolean
  render(): void
  dispose(): void
}

const FOV = 30

function frameCamera(camera: PerspectiveCamera, aspect: number): void {
  const framing = frameDevices(aspect, FOV)
  camera.aspect = aspect
  camera.position.set(0, framing.cameraY, framing.cameraZ)
  camera.lookAt(0, framing.targetY, 0)
  camera.updateProjectionMatrix()
}

/** Builds the device scene on `canvas`, or returns null when WebGL is unavailable. */
export function createDeviceScene(canvas: HTMLCanvasElement, options: DeviceSceneOptions = {}): DeviceScene | null {
  const renderer = createRenderer(canvas)
  if (!renderer) return null

  const scene = new Scene()
  const environment = createEnvironment(renderer)
  scene.environment = environment
  addLights(scene)
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100)
  const rig = createDeviceRig(scene)
  const motion = createDeviceMotion(rig)
  const feed = createScreenFeed(renderer, rig, {
    loadTexture: options.loadTexture,
    createPlaceholder: options.createPlaceholder ?? createPlaceholderTexture,
    onChange: options.onChange,
  })

  return {
    scene,
    resize(width, height) {
      if (width <= 0 || height <= 0) return
      renderer.setSize(width, height, false)
      frameCamera(camera, width / height)
    },
    setSlide(slide, { immediate }) {
      motion.setSlide(slide, immediate)
      feed.show(slide, immediate)
      options.onChange?.()
    },
    prefetch(slides) {
      feed.prefetch(slides)
    },
    playIntro({ immediate }) {
      motion.playIntro(immediate)
      options.onChange?.()
    },
    setPointer(x, y) {
      motion.setPointer(x, y)
      options.onChange?.()
    },
    update(nowMs) {
      const moving = motion.update(nowMs)
      const fading = feed.update(nowMs)
      return moving || fading
    },
    render() {
      renderer.render(scene, camera)
    },
    dispose() {
      feed.dispose()
      rig.dispose()
      environment?.dispose()
      renderer.dispose()
    },
  }
}

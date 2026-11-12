// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import {
  AmbientLight,
  DirectionalLight,
  LinearSRGBColorSpace,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
  type Light,
} from 'three'
import type { Theme } from '../../hooks/useTheme'
import type { LightIntensities } from './sphereScene'
import { patchPhongShader, SPHERE_PALETTE } from './sphereShader'

export interface Point {
  readonly x: number
  readonly y: number
}

/** How far the orb leans toward the pointer, each axis in [-1, 1]. */
export interface OrbLean {
  readonly x: number
  readonly y: number
}

export interface ChatOrbScene {
  readonly scene: Scene
  setTheme(theme: Theme): void
  resize(sizePx: number, devicePixelRatio: number): void
  tick(elapsedMs: number, lean: OrbLean): void
  render(): void
  dispose(): void
}

const CAMERA_FOV = 54
const CAMERA_Z = 52
const ORB_RADIUS = 17
const ORB_SEGMENTS = 64
// About half the hero's bumps, so the orb reads as a soft blob at button size.
const DISPLACEMENT_SCALE = 0.55
const NOISE_SPEED = 0.00009
const SPIN_SPEED = 0.00009
const LEAN_ANGLE = 0.75
const LEAN_OFFSET = 1.6
const BREATH_AMOUNT = 0.02
const BREATH_SPEED = 0.002
const LEAN_RANGE_PX = 260
const LEAN_REACH_PX = 400
const MAX_PIXEL_RATIO = 2

const UPRIGHT: OrbLean = { x: 0, y: 0 }

export function getOrbLightIntensities(theme: Theme): LightIntensities {
  return theme === 'light' ? { directional: 1.8, ambient: 2.7 } : { directional: 2.6, ambient: 1.1 }
}

function clampUnit(value: number): number {
  return Math.max(-1, Math.min(1, value))
}

/** Leans toward a nearby pointer; pointers farther than the reach leave it upright. */
export function getOrbLean(pointer: Point, center: Point): OrbLean {
  const dx = pointer.x - center.x
  const dy = pointer.y - center.y
  if (Math.hypot(dx, dy) > LEAN_REACH_PX) return UPRIGHT
  return { x: clampUnit(dx / LEAN_RANGE_PX), y: clampUnit(dy / LEAN_RANGE_PX) }
}

function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      failIfMajorPerformanceCaveat: true,
    })
    renderer.outputColorSpace = LinearSRGBColorSpace
    return renderer
  } catch {
    // No WebGL, or only a slow software fallback. The launcher keeps its CSS orb.
    return null
  }
}

function createOrbMaterial(time: { value: number }): MeshPhongMaterial {
  const material = new MeshPhongMaterial()
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = time
    // Linear output colour space, so raw sRGB values render as the hex codes.
    shader.uniforms.uColorPrimary = { value: new Vector3(...SPHERE_PALETTE.primary) }
    shader.uniforms.uColorSecondary = { value: new Vector3(...SPHERE_PALETTE.secondary) }
    const patched = patchPhongShader(shader, { displacementScale: DISPLACEMENT_SCALE })
    shader.vertexShader = patched.vertexShader
    shader.fragmentShader = patched.fragmentShader
  }
  return material
}

function createLights(theme: Theme): readonly Light[] {
  const { directional, ambient } = getOrbLightIntensities(theme)
  const key = new DirectionalLight(0xffffff, directional)
  key.position.set(100, 100, 200)
  return [key, new AmbientLight(0xffffff, ambient)]
}

/** Builds the chat button's noise orb, or returns null when WebGL is unavailable. */
export function createChatOrbScene(canvas: HTMLCanvasElement): ChatOrbScene | null {
  const renderer = createRenderer(canvas)
  if (!renderer) return null

  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
  camera.position.z = CAMERA_Z

  const time = { value: 0 }
  const geometry = new SphereGeometry(ORB_RADIUS, ORB_SEGMENTS, ORB_SEGMENTS)
  const material = createOrbMaterial(time)
  const orb = new Mesh(geometry, material)
  const scene = new Scene()
  scene.add(orb)

  let lights: readonly Light[] = []

  return {
    scene,
    setTheme(theme) {
      for (const light of lights) {
        scene.remove(light)
        light.dispose()
      }
      lights = createLights(theme)
      scene.add(...lights)
    },
    resize(sizePx, devicePixelRatio) {
      renderer.setPixelRatio(Math.min(MAX_PIXEL_RATIO, devicePixelRatio))
      // CSS sizes the canvas; only the drawing buffer changes here.
      renderer.setSize(sizePx, sizePx, false)
    },
    tick(elapsedMs, lean) {
      time.value = NOISE_SPEED * elapsedMs
      orb.rotation.set(lean.y * LEAN_ANGLE, lean.x * LEAN_ANGLE, SPIN_SPEED * elapsedMs)
      orb.position.set(lean.x * LEAN_OFFSET, -lean.y * LEAN_OFFSET, 0)
      orb.scale.setScalar(1 + BREATH_AMOUNT * Math.sin(elapsedMs * BREATH_SPEED))
    },
    render() {
      renderer.render(scene, camera)
    },
    dispose() {
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    },
  }
}

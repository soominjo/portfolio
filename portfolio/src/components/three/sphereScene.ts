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
import { patchPhongShader, SPHERE_PALETTE } from './sphereShader'

export interface SpherePosition {
  readonly x: number
  readonly y: number
}

export interface LightIntensities {
  readonly directional: number
  readonly ambient: number
}

export interface SphereScene {
  readonly scene: Scene
  setTheme(theme: Theme): void
  resize(width: number, height: number): void
  tick(elapsedMs: number, rotationX: number, rotationY: number): void
  render(): void
  dispose(): void
}

// Tailwind's md and lg breakpoints.
const TABLET_MIN_WIDTH = 768
const DESKTOP_MIN_WIDTH = 1024

const CAMERA_FOV = 54
const CAMERA_Z = 52
const SPHERE_RADIUS = 32
const SPHERE_SEGMENTS = 128
const NOISE_SPEED = 0.00005
const DRIFT_PER_FRAME = 0.001

export function getSpherePosition(viewportWidth: number): SpherePosition {
  if (viewportWidth < TABLET_MIN_WIDTH) return { x: 14, y: 10 }
  if (viewportWidth < DESKTOP_MIN_WIDTH) return { x: 18, y: 14 }
  return { x: 22, y: 16 }
}

export function getLightIntensities(theme: Theme): LightIntensities {
  return theme === 'light' ? { directional: 1.8, ambient: 2.7 } : { directional: 2, ambient: 0.4 }
}

function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    })
    renderer.setPixelRatio(1)
    renderer.outputColorSpace = LinearSRGBColorSpace
    return renderer
  } catch {
    // No WebGL, or only a slow software fallback. three has already logged
    // why; the hero is complete without the sphere, so just skip it.
    return null
  }
}

function createSphereMaterial(time: { value: number }): MeshPhongMaterial {
  const material = new MeshPhongMaterial()
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = time
    // Linear output colour space, so raw sRGB values render as the hex codes.
    shader.uniforms.uColorPrimary = { value: new Vector3(...SPHERE_PALETTE.primary) }
    shader.uniforms.uColorSecondary = { value: new Vector3(...SPHERE_PALETTE.secondary) }
    const patched = patchPhongShader(shader)
    shader.vertexShader = patched.vertexShader
    shader.fragmentShader = patched.fragmentShader
  }
  return material
}

function createLights(theme: Theme): readonly Light[] {
  const { directional, ambient } = getLightIntensities(theme)
  const key = new DirectionalLight(0xffffff, directional)
  key.position.set(100, 100, 200)
  return [key, new AmbientLight(0xffffff, ambient)]
}

/** Builds the noise sphere, or returns null when WebGL is unavailable. */
export function createSphereScene(canvas: HTMLCanvasElement): SphereScene | null {
  const renderer = createRenderer(canvas)
  if (!renderer) return null

  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 100)
  camera.position.z = CAMERA_Z

  const time = { value: 0 }
  const geometry = new SphereGeometry(SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS)
  const material = createSphereMaterial(time)
  const sphere = new Mesh(geometry, material)
  const scene = new Scene()
  scene.add(sphere)

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
    resize(width, height) {
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      const { x, y } = getSpherePosition(width)
      sphere.position.set(x, y, 0)
    },
    tick(elapsedMs, rotationX, rotationY) {
      time.value = NOISE_SPEED * elapsedMs
      sphere.rotation.z += DRIFT_PER_FRAME
      sphere.rotation.x = rotationX
      sphere.rotation.y = rotationY
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

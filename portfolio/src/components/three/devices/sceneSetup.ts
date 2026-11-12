import {
  DirectionalLight,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  PlaneGeometry,
  PMREMGenerator,
  SRGBColorSpace,
  WebGLRenderer,
  type Scene,
  type Texture,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const MAX_PIXEL_RATIO = 2

export function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer | null {
  try {
    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO))
    renderer.outputColorSpace = SRGBColorSpace
    renderer.toneMapping = NeutralToneMapping
    return renderer
  } catch {
    // No WebGL, or only a slow software fallback; three has logged why.
    return null
  }
}

/** A studio-like reflection map so the aluminium reads as metal. */
export function createEnvironment(renderer: WebGLRenderer): Texture | null {
  const room = new RoomEnvironment()
  try {
    const pmrem = new PMREMGenerator(renderer)
    const texture = pmrem.fromScene(room, 0.04).texture
    pmrem.dispose()
    return texture
  } catch {
    // The devices still render with the plain lights alone.
    return null
  } finally {
    room.dispose()
  }
}

/** Soft sky fill, a white key light, and an indigo rim that outlines dark finishes. */
export function addLights(scene: Scene): void {
  const sky = new HemisphereLight('#dfe6ff', '#0b0d16', 0.6)
  const key = new DirectionalLight('#ffffff', 2.2)
  key.position.set(3, 5, 4)
  const rim = new DirectionalLight('#818cf8', 1.6)
  rim.position.set(-4, 2.5, -3)
  scene.add(sky, key, rim)
}

export interface Shadow {
  readonly mesh: Mesh<PlaneGeometry, MeshBasicMaterial>
  /** Scales the shadow's opacity, 0..1. */
  setStrength(t: number): void
  dispose(): void
}

/** A flat contact shadow on the ground (y = 0). The texture is shared and not disposed here. */
export function createShadow(texture: Texture, width: number, depth: number, opacity: number): Shadow {
  const geometry = new PlaneGeometry(width, depth)
  geometry.rotateX(-Math.PI / 2)
  const material = new MeshBasicMaterial({ map: texture, transparent: true, opacity, depthWrite: false, toneMapped: false })
  const mesh = new Mesh(geometry, material)
  mesh.position.y = 0.002
  mesh.renderOrder = -1
  return {
    mesh,
    setStrength(t) {
      material.opacity = opacity * t
    },
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}

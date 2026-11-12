import { Group, Mesh, MeshBasicMaterial, type BufferGeometry, type Texture } from 'three'
import { clamp01 } from './motionMath'

/** A screen that cross-fades between two textures. */
export interface ScreenLayers {
  readonly group: Group
  /** Shows a texture: at once if the screen is blank, else on the top layer at opacity 0. */
  show(texture: Texture): void
  /** Opacity of the incoming (top) texture, 0..1. */
  setFade(t: number): void
  /** Makes the faded-in texture the base and clears the top layer. */
  commit(): void
  /** Textures currently on screen, base first. */
  displayed(): readonly Texture[]
  dispose(): void
}

// Far enough in front to win the depth test, too small to see.
const TOP_LAYER_OFFSET = 0.0008

type LayerMesh = Mesh<BufferGeometry, MeshBasicMaterial>

function createLayer(geometry: BufferGeometry, name: string, transparent: boolean): LayerMesh {
  // Unlit and untoned: a screenshot should look exactly like itself.
  const material = new MeshBasicMaterial({ transparent, opacity: 0, toneMapped: false, depthWrite: !transparent })
  const mesh = new Mesh(geometry, material)
  mesh.name = name
  mesh.visible = false
  return mesh
}

function setLayer(mesh: LayerMesh, texture: Texture | null, opacity: number): void {
  const hadMap = mesh.material.map !== null
  mesh.material.map = texture
  mesh.material.opacity = opacity
  // Only adding or removing a map changes the shader; swapping maps doesn't.
  if (hadMap !== (texture !== null)) mesh.material.needsUpdate = true
  mesh.visible = texture !== null
}

/** Two stacked screen meshes named `${name}-base` and `${name}-top`, sharing `geometry`. */
export function createScreenLayers(geometry: BufferGeometry, name: string): ScreenLayers {
  const group = new Group()
  group.name = name
  const base = createLayer(geometry, `${name}-base`, false)
  const top = createLayer(geometry, `${name}-top`, true)
  top.position.z = TOP_LAYER_OFFSET
  top.renderOrder = 1
  group.add(base, top)

  return {
    group,
    show(texture) {
      if (base.material.map === null) setLayer(base, texture, 1)
      else setLayer(top, texture, 0)
    },
    setFade(t) {
      top.material.opacity = clamp01(t)
    },
    commit() {
      if (top.material.map === null) return
      setLayer(base, top.material.map, 1)
      setLayer(top, null, 0)
    },
    displayed() {
      return [base.material.map, top.material.map].filter((texture): texture is Texture => texture !== null)
    },
    dispose() {
      base.material.dispose()
      top.material.dispose()
    },
  }
}

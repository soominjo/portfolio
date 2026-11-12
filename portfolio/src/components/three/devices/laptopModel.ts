import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three'
import type { DeviceMaterials } from './deviceMaterials'
import { createRoundedPlane, createRoundedSlab } from './roundedRect'
import { createScreenLayers, type ScreenLayers } from './screenLayers'

/** World units; the laptop's base sits on y = 0, centred on x and z. */
export const LAPTOP = {
  width: 3,
  depth: 2.05,
  baseThickness: 0.075,
  lidHeight: 2,
  lidThickness: 0.05,
  screenWidth: 2.72,
  screenHeight: 1.7,
} as const

/** Lid angles about its hinge: folded onto the keyboard, and tipped slightly back. */
export const LID_CLOSED = Math.PI / 2
export const LID_OPEN = -0.2

export interface LaptopModel {
  readonly group: Group
  /** Pivot at the hinge; rotate its x to open and close the lid. */
  readonly lid: Group
  readonly screen: ScreenLayers
  readonly screenAspect: number
  dispose(): void
}

const CORNER_RADIUS = 0.14
// Keyboard layout in key widths: a short function row, four full rows, and a
// bottom row with a wide space bar. Every row spans 14 key widths.
const KEY_ROWS: readonly (readonly number[])[] = [
  Array(14).fill(1),
  Array(14).fill(1),
  Array(14).fill(1),
  Array(14).fill(1),
  Array(14).fill(1),
  [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1],
]
const KEY_PITCH_X = 0.185
const KEY_PITCH_Z = 0.17
const KEY_GAP = 0.03
const KEY_HEIGHT = 0.012
const KEYBOARD_START_Z = -0.82
const FUNCTION_ROW_DEPTH = 0.6
// The bottom bezel is a little taller than the top one, as on real laptops.
const SCREEN_LIFT = 0.04

function createKeys(material: Material): InstancedMesh {
  const count = KEY_ROWS.reduce((total, row) => total + row.length, 0)
  const keys = new InstancedMesh(new BoxGeometry(1, 1, 1), material, count)
  const matrix = new Matrix4()
  const rotation = new Quaternion()
  let index = 0
  KEY_ROWS.forEach((row, rowIndex) => {
    const depth = (rowIndex === 0 ? FUNCTION_ROW_DEPTH : 1) * KEY_PITCH_Z - KEY_GAP
    const z = KEYBOARD_START_Z + (rowIndex + 0.5) * KEY_PITCH_Z
    let x = (-14 * KEY_PITCH_X) / 2
    for (const units of row) {
      const width = units * KEY_PITCH_X
      const position = new Vector3(x + width / 2, LAPTOP.baseThickness + KEY_HEIGHT / 2, z)
      keys.setMatrixAt(index++, matrix.compose(position, rotation, new Vector3(width - KEY_GAP, KEY_HEIGHT, depth)))
      x += width
    }
  })
  keys.instanceMatrix.needsUpdate = true
  return keys
}

function createBase(materials: DeviceMaterials, track: <T extends BufferGeometry>(g: T) => T): Mesh[] {
  const base = track(createRoundedSlab(LAPTOP.width, LAPTOP.depth, CORNER_RADIUS, LAPTOP.baseThickness))
  base.rotateX(-Math.PI / 2) // lie flat: the slab's front face becomes the deck
  base.translate(0, LAPTOP.baseThickness, 0)

  const pad = track(createRoundedPlane(1.15, 0.66, 0.06))
  pad.rotateX(-Math.PI / 2)
  pad.translate(0, LAPTOP.baseThickness + 0.001, 0.62)

  const hinge = track(new CylinderGeometry(0.035, 0.035, LAPTOP.width * 0.8, 16))
  hinge.rotateZ(Math.PI / 2)
  hinge.translate(0, LAPTOP.baseThickness, -LAPTOP.depth / 2)

  const baseMesh = new Mesh(base, materials.body)
  baseMesh.name = 'laptop-base'
  return [baseMesh, new Mesh(pad, materials.pad), new Mesh(hinge, materials.trim)]
}

function createLid(materials: DeviceMaterials, track: <T extends BufferGeometry>(g: T) => T) {
  const lid = new Group()
  lid.name = 'laptop-lid'
  lid.position.set(0, LAPTOP.baseThickness, -LAPTOP.depth / 2)
  lid.rotation.x = LID_CLOSED

  const shell = track(createRoundedSlab(LAPTOP.width, LAPTOP.lidHeight, CORNER_RADIUS, LAPTOP.lidThickness))
  shell.translate(0, LAPTOP.lidHeight / 2, 0)

  const glass = track(createRoundedPlane(LAPTOP.width - 0.04, LAPTOP.lidHeight - 0.04, CORNER_RADIUS - 0.02))
  glass.translate(0, LAPTOP.lidHeight / 2, 0.001)

  const screen = createScreenLayers(track(new PlaneGeometry(LAPTOP.screenWidth, LAPTOP.screenHeight)), 'laptop-screen')
  screen.group.position.set(0, LAPTOP.lidHeight / 2 + SCREEN_LIFT, 0.002)

  lid.add(new Mesh(shell, materials.body), new Mesh(glass, materials.glass), screen.group)
  return { lid, screen }
}

/** A laptop built from rounded slabs, with the lid closed. */
export function createLaptop(materials: DeviceMaterials): LaptopModel {
  const geometries: BufferGeometry[] = []
  const track = <T extends BufferGeometry>(geometry: T): T => {
    geometries.push(geometry)
    return geometry
  }

  const group = new Group()
  group.name = 'laptop'
  const keys = createKeys(materials.keys)
  geometries.push(keys.geometry)
  const { lid, screen } = createLid(materials, track)
  group.add(...createBase(materials, track), keys, lid)

  return {
    group,
    lid,
    screen,
    screenAspect: LAPTOP.screenWidth / LAPTOP.screenHeight,
    dispose() {
      for (const geometry of geometries) geometry.dispose()
      keys.dispose()
      screen.dispose()
    },
  }
}

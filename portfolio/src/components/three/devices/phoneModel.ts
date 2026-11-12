import { BoxGeometry, Group, Mesh, type BufferGeometry } from 'three'
import type { DeviceMaterials } from './deviceMaterials'
import { createRoundedPlane, createRoundedSlab } from './roundedRect'
import { createScreenLayers, type ScreenLayers } from './screenLayers'

/** World units; the phone stands on y = 0, centred on x and z, screen facing +z. */
export const PHONE = {
  width: 0.74,
  height: 1.52,
  depth: 0.075,
  screenWidth: 0.68,
  screenHeight: 1.46,
} as const

export interface PhoneModel {
  readonly group: Group
  readonly screen: ScreenLayers
  readonly screenAspect: number
  dispose(): void
}

const CORNER_RADIUS = 0.115
const FRONT = PHONE.depth / 2
const CENTRE_Y = PHONE.height / 2

/** Volume buttons on the left edge and the side button on the right. */
function createButtons(materials: DeviceMaterials, track: <T extends BufferGeometry>(g: T) => T): Mesh[] {
  const button = track(new BoxGeometry(0.012, 0.15, 0.03))
  const placements: readonly [x: number, y: number][] = [
    [-PHONE.width / 2 - 0.003, PHONE.height * 0.72],
    [-PHONE.width / 2 - 0.003, PHONE.height * 0.6],
    [PHONE.width / 2 + 0.003, PHONE.height * 0.66],
  ]
  return placements.map(([x, y]) => {
    const mesh = new Mesh(button, materials.body)
    mesh.position.set(x, y, 0)
    return mesh
  })
}

/** A modern phone: rounded aluminium frame, black glass, a camera island. */
export function createPhone(materials: DeviceMaterials): PhoneModel {
  const geometries: BufferGeometry[] = []
  const track = <T extends BufferGeometry>(geometry: T): T => {
    geometries.push(geometry)
    return geometry
  }

  const body = track(createRoundedSlab(PHONE.width, PHONE.height, CORNER_RADIUS, PHONE.depth))
  body.translate(0, CENTRE_Y, FRONT)

  const glass = track(createRoundedPlane(PHONE.width - 0.02, PHONE.height - 0.02, CORNER_RADIUS - 0.01))
  glass.translate(0, CENTRE_Y, FRONT + 0.0008)

  const screen = createScreenLayers(track(createRoundedPlane(PHONE.screenWidth, PHONE.screenHeight, 0.085)), 'phone-screen')
  screen.group.position.set(0, CENTRE_Y, FRONT + 0.0016)

  const island = track(createRoundedPlane(0.2, 0.055, 0.0275))
  island.translate(0, CENTRE_Y + PHONE.screenHeight / 2 - 0.06, FRONT + 0.003)

  const group = new Group()
  group.name = 'phone'
  group.add(
    new Mesh(body, materials.body),
    new Mesh(glass, materials.glass),
    screen.group,
    new Mesh(island, materials.trim),
    ...createButtons(materials, track),
  )

  return {
    group,
    screen,
    screenAspect: PHONE.screenWidth / PHONE.screenHeight,
    dispose() {
      for (const geometry of geometries) geometry.dispose()
      screen.dispose()
    },
  }
}

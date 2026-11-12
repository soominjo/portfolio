import { Group, type Scene } from 'three'
import { createDeviceMaterials, disposeDeviceMaterials, type DeviceMaterials } from './deviceMaterials'
import { FINISHES } from './finishes'
import { createLaptop, type LaptopModel } from './laptopModel'
import { clamp01, lerp } from './motionMath'
import { createPhone, type PhoneModel } from './phoneModel'
import { createShadow } from './sceneSetup'
import { createShadowTexture } from './shadowTexture'

/** The whole composition turns a little to the left, like a product shot. */
export const RIG_TURN_Y = -0.32
const RIG_OFFSET_X = -0.15
const PHONE_SPOT = { x: 1.95, z: 0.6, turnY: -0.25 } as const
// Where the phone waits, below and slightly smaller, while it is away.
const PHONE_AWAY = { y: -0.9, scale: 0.85 } as const

/** Everything the animation decides each frame. */
export interface DevicePose {
  readonly lidAngle: number
  readonly laptopX: number
  /** 0 = phone away, 1 = standing in place. */
  readonly phonePresence: number
  readonly leanX: number
  readonly leanY: number
}

export interface DeviceRig {
  readonly materials: DeviceMaterials
  readonly laptop: LaptopModel
  readonly phone: PhoneModel
  applyPose(pose: DevicePose): void
  dispose(): void
}

/** Builds the laptop, phone and their shadows inside a group named `rig`, added to `scene`. */
export function createDeviceRig(scene: Scene): DeviceRig {
  const materials = createDeviceMaterials(FINISHES.silver)
  const laptop = createLaptop(materials)
  const phone = createPhone(materials)

  const shadowTexture = createShadowTexture()
  const laptopShadow = createShadow(shadowTexture, 4.6, 3.4, 0.55)
  laptopShadow.mesh.position.z = -0.15
  laptop.group.add(laptopShadow.mesh) // moves with the laptop
  const phoneShadow = createShadow(shadowTexture, 1.4, 0.8, 0.5)
  phoneShadow.mesh.position.set(PHONE_SPOT.x, 0.002, PHONE_SPOT.z) // stays on the ground

  phone.group.position.set(PHONE_SPOT.x, PHONE_AWAY.y, PHONE_SPOT.z)
  phone.group.rotation.y = PHONE_SPOT.turnY
  phone.group.visible = false

  const rig = new Group()
  rig.name = 'rig'
  rig.position.x = RIG_OFFSET_X
  rig.rotation.y = RIG_TURN_Y
  rig.add(laptop.group, phone.group, phoneShadow.mesh)
  scene.add(rig)

  return {
    materials,
    laptop,
    phone,
    applyPose(pose) {
      laptop.lid.rotation.x = pose.lidAngle
      laptop.group.position.x = pose.laptopX
      const presence = clamp01(pose.phonePresence)
      phone.group.position.y = lerp(PHONE_AWAY.y, 0, presence)
      phone.group.scale.setScalar(lerp(PHONE_AWAY.scale, 1, presence))
      phone.group.visible = presence > 0.01
      phoneShadow.setStrength(presence)
      rig.rotation.set(pose.leanX, RIG_TURN_Y + pose.leanY, 0)
    },
    dispose() {
      laptop.dispose()
      phone.dispose()
      laptopShadow.dispose()
      phoneShadow.dispose()
      shadowTexture.dispose()
      disposeDeviceMaterials(materials)
    },
  }
}

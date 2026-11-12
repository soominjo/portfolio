import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import type { FinishSpec } from './finishes'
import { lerp } from './motionMath'

/** Materials shared by the laptop and phone, so one finish change recolours both. */
export interface DeviceMaterials {
  /** Aluminium shell. */
  readonly body: MeshPhysicalMaterial
  /** Trackpad: the body colour, a little rougher so it reads against the deck. */
  readonly pad: MeshPhysicalMaterial
  readonly keys: MeshStandardMaterial
  /** Black glass around the screens. */
  readonly glass: MeshPhysicalMaterial
  /** Hinge, camera island and other near-black trim. */
  readonly trim: MeshStandardMaterial
}

const PAD_EXTRA_ROUGHNESS = 0.18

export function createDeviceMaterials(finish: FinishSpec): DeviceMaterials {
  return {
    body: new MeshPhysicalMaterial({
      color: finish.body,
      metalness: finish.metalness,
      roughness: finish.roughness,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    }),
    pad: new MeshPhysicalMaterial({
      color: finish.body,
      metalness: finish.metalness,
      roughness: Math.min(1, finish.roughness + PAD_EXTRA_ROUGHNESS),
    }),
    keys: new MeshStandardMaterial({ color: finish.keys, roughness: 0.65, metalness: 0.1 }),
    glass: new MeshPhysicalMaterial({ color: '#050507', roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }),
    trim: new MeshStandardMaterial({ color: '#0b0c0f', roughness: 0.5, metalness: 0.2 }),
  }
}

/** Sets the materials partway (`t` 0..1) from one finish to another. */
export function applyFinish(materials: DeviceMaterials, from: FinishSpec, to: FinishSpec, t: number): void {
  const metalness = lerp(from.metalness, to.metalness, t)
  const roughness = lerp(from.roughness, to.roughness, t)
  materials.body.color.lerpColors(new Color(from.body), new Color(to.body), t)
  materials.body.metalness = metalness
  materials.body.roughness = roughness
  materials.pad.color.copy(materials.body.color)
  materials.pad.metalness = metalness
  materials.pad.roughness = Math.min(1, roughness + PAD_EXTRA_ROUGHNESS)
  materials.keys.color.lerpColors(new Color(from.keys), new Color(to.keys), t)
}

export function disposeDeviceMaterials(materials: DeviceMaterials): void {
  for (const material of Object.values(materials)) material.dispose()
}

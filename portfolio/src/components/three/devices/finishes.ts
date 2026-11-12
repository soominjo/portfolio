import type { DeviceFinish } from '../../../../../shared/types/project'

/** Material values for one device colourway. */
export interface FinishSpec {
  /** Aluminium shell colour. */
  readonly body: string
  readonly metalness: number
  readonly roughness: number
  /** Keycap colour. */
  readonly keys: string
}

export const FINISHES: Readonly<Record<DeviceFinish, FinishSpec>> = {
  silver: { body: '#c7cad0', metalness: 0.85, roughness: 0.32, keys: '#24262b' },
  black: { body: '#2a2c31', metalness: 0.55, roughness: 0.42, keys: '#101114' },
  white: { body: '#eef0f3', metalness: 0.08, roughness: 0.38, keys: '#b5bac3' },
}

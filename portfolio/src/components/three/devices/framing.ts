/** Where the camera sits for a given canvas shape. */
export interface Framing {
  readonly cameraZ: number
  readonly cameraY: number
  readonly targetY: number
}

// World-space box the laptop and phone fill, with the lid open. The height
// includes room under the phone, which stands nearer the camera and so
// projects lower on wide, short canvases.
const COMPOSITION = { width: 4.6, height: 3.0 } as const
const MARGIN = 1.08
const MIN_ASPECT = 0.5
const TARGET_Y = 0.95
// How far the camera rises per unit of distance, to look down onto the keyboard.
const LOOK_DOWN = 0.22

/**
 * Pulls the camera back just far enough to fit the composition: narrow
 * canvases are limited by its width, wide ones by its height.
 */
export function frameDevices(aspect: number, fovDegrees: number): Framing {
  const safeAspect = Number.isFinite(aspect) ? Math.max(aspect, MIN_ASPECT) : MIN_ASPECT
  const tanHalfFov = Math.tan((fovDegrees * Math.PI) / 360)
  const fitHeight = COMPOSITION.height / 2 / tanHalfFov
  const fitWidth = COMPOSITION.width / 2 / (tanHalfFov * safeAspect)
  const cameraZ = Math.max(fitHeight, fitWidth) * MARGIN
  return { cameraZ, cameraY: TARGET_Y + cameraZ * LOOK_DOWN, targetY: TARGET_Y }
}

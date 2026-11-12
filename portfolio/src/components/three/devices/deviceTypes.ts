import type { DeviceFinish } from '../../../../../shared/types/project'

/**
 * What the showcase devices display for one project. Kept free of three.js
 * imports so the page can build slides without pulling three into its chunk.
 */
export interface DeviceSlide {
  readonly id: string
  /** Project title, used for the placeholder screen. */
  readonly label: string
  readonly desktopUrl: string | null
  readonly mobileUrl: string | null
  readonly showPhone: boolean
  readonly finish: DeviceFinish
  /** Which part of a too-wide desktop screenshot to keep: 0 left, 0.5 centre, 1 right. */
  readonly desktopFocusX: number
}

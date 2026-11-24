import { COMPOSITION, MARGIN } from '../../three/devices/framing'
import type { ViewRect } from './backdropTypes'

/**
 * The virtual stage every scene draws on: the 1440 x 900 layout of the
 * previews, with the laptop and phone centred at (1008, 450) and 780 units wide.
 */
export const VIRTUAL = { width: 1440, height: 900, centerX: 1008, centerY: 450, deviceWidth: 780 } as const

// Like the old CSS rings: solid to 15% of the way to the farthest corner, gone by 65%.
const MASK_INNER = 0.15
const MASK_OUTER = 0.65
// Stacked layouts fade the scene out across the bottom of the device cell, so
// the text below it stays clean: from this share of the stage height above
// the cell's bottom edge to this share below it.
const STACKED_FADE_ABOVE = 0.06
const STACKED_FADE_BELOW = 0.04
const MIN_SCALE = 0.25
const MAX_SCALE = 1.6

export interface Size {
  readonly width: number
  readonly height: number
}

/** A box in CSS pixels, relative to the stage's top-left corner. */
export interface Box extends Size {
  readonly left: number
  readonly top: number
}

/** Where the virtual stage sits on the real one. */
export interface BackdropLayout extends Size {
  /** The device centre, in CSS pixels from the stage's top-left corner. */
  readonly anchorX: number
  readonly anchorY: number
  /** CSS pixels per virtual unit. */
  readonly scale: number
  /** The whole stage, in virtual units. */
  readonly view: ViewRect
  /** Mask radii around the device centre, in virtual units. */
  readonly maskInner: number
  readonly maskOuter: number
  /** Stacked layouts only: the virtual y where the scene starts to fade, and where it is gone. */
  readonly fade: { readonly from: number; readonly to: number } | null
}

/** How wide the 3D framing draws the laptop and phone inside a device cell, in CSS pixels. */
export function deviceWidthIn(cellWidth: number, cellHeight: number): number {
  const fitted = Math.min(cellWidth, cellHeight * (COMPOSITION.width / COMPOSITION.height))
  return fitted / MARGIN
}

/**
 * Maps the virtual stage onto the real one: the virtual device centre lands
 * on the middle of the device cell, at the size the 3D framing gives the
 * devices. Null when the stage or the cell has no size, as when short screens
 * hide the devices.
 */
export function computeLayout(stage: Size, cell: Box, stacked: boolean): BackdropLayout | null {
  if (stage.width <= 0 || stage.height <= 0 || cell.width <= 0 || cell.height <= 0) return null
  const rawScale = deviceWidthIn(cell.width, cell.height) / VIRTUAL.deviceWidth
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, rawScale))
  const anchorX = cell.left + cell.width / 2
  const anchorY = cell.top + cell.height / 2
  const toX = (x: number) => VIRTUAL.centerX + (x - anchorX) / scale
  const toY = (y: number) => VIRTUAL.centerY + (y - anchorY) / scale
  const farthest = Math.hypot(Math.max(anchorX, stage.width - anchorX), Math.max(anchorY, stage.height - anchorY))
  const cellBottom = cell.top + cell.height
  return {
    width: stage.width,
    height: stage.height,
    anchorX,
    anchorY,
    scale,
    view: { left: toX(0), top: toY(0), right: toX(stage.width), bottom: toY(stage.height) },
    maskInner: (farthest * MASK_INNER) / scale,
    maskOuter: (farthest * MASK_OUTER) / scale,
    fade: stacked
      ? { from: toY(cellBottom - stage.height * STACKED_FADE_ABOVE), to: toY(cellBottom + stage.height * STACKED_FADE_BELOW) }
      : null,
  }
}

export type Transform = readonly [a: number, b: number, c: number, d: number, e: number, f: number]

/** The canvas transform that draws virtual units at their stage position, on a canvas `ratio` times the CSS size. */
export function sceneTransform(layout: BackdropLayout, ratio: number): Transform {
  const unit = layout.scale * ratio
  return [
    unit,
    0,
    0,
    unit,
    (layout.anchorX - VIRTUAL.centerX * layout.scale) * ratio,
    (layout.anchorY - VIRTUAL.centerY * layout.scale) * ratio,
  ]
}

/** Two layouts that would draw the same picture. */
export function sameLayout(a: BackdropLayout | null, b: BackdropLayout | null): boolean {
  if (!a || !b) return a === b
  return (
    a.width === b.width &&
    a.height === b.height &&
    a.anchorX === b.anchorX &&
    a.anchorY === b.anchorY &&
    a.scale === b.scale &&
    (a.fade === null) === (b.fade === null)
  )
}

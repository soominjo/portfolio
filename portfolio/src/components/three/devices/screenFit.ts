/** Texture repeat/offset values, in UV units. */
export interface UvTransform {
  readonly repeatX: number
  readonly repeatY: number
  readonly offsetX: number
  readonly offsetY: number
}

const IDENTITY: UvTransform = { repeatX: 1, repeatY: 1, offsetX: 0, offsetY: 0 }

function isValidAspect(aspect: number): boolean {
  return Number.isFinite(aspect) && aspect > 0
}

/**
 * CSS `object-fit: cover` for a texture: fill the screen without stretching.
 * A wider image loses slices from its sides: `focusX` 0 keeps the left edge,
 * 1 keeps the right, 0.5 (the default) crops both evenly. A taller image loses
 * its bottom, so a page screenshot keeps its header. (UV y runs bottom to top.)
 */
export function coverTransform(imageAspect: number, screenAspect: number, focusX = 0.5): UvTransform {
  if (!isValidAspect(imageAspect) || !isValidAspect(screenAspect)) return IDENTITY
  const ratio = imageAspect / screenAspect
  const focus = Math.min(1, Math.max(0, focusX))
  if (ratio > 1) return { repeatX: 1 / ratio, repeatY: 1, offsetX: (1 - 1 / ratio) * focus, offsetY: 0 }
  if (ratio < 1) return { repeatX: 1, repeatY: ratio, offsetX: 0, offsetY: 1 - ratio }
  return IDENTITY
}

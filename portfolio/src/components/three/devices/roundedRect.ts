import { ExtrudeGeometry, Shape, ShapeGeometry } from 'three'

const BEVEL = 0.012
const CURVE_SEGMENTS = 10

/** A rectangle with circular corners, centred on the origin. */
export function roundedRectShape(width: number, height: number, radius: number): Shape {
  const r = Math.max(0.0001, Math.min(radius, width / 2, height / 2))
  const left = -width / 2
  const bottom = -height / 2
  const right = left + width
  const top = bottom + height
  const shape = new Shape()
  shape.moveTo(left + r, bottom)
  shape.lineTo(right - r, bottom)
  shape.absarc(right - r, bottom + r, r, -Math.PI / 2, 0, false)
  shape.lineTo(right, top - r)
  shape.absarc(right - r, top - r, r, 0, Math.PI / 2, false)
  shape.lineTo(left + r, top)
  shape.absarc(left + r, top - r, r, Math.PI / 2, Math.PI, false)
  shape.lineTo(left, bottom + r)
  shape.absarc(left + r, bottom + r, r, Math.PI, Math.PI * 1.5, false)
  return shape
}

/**
 * A rounded slab with softened edges: centred in x/y, spanning z from
 * -depth to 0 (its front face). The bevel stays inside the given size.
 */
export function createRoundedSlab(width: number, height: number, radius: number, depth: number): ExtrudeGeometry {
  const bevel = Math.min(BEVEL, depth / 4, width / 4, height / 4)
  const shape = roundedRectShape(width - 2 * bevel, height - 2 * bevel, radius - bevel)
  const geometry = new ExtrudeGeometry(shape, {
    depth: depth - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: CURVE_SEGMENTS,
  })
  geometry.translate(0, 0, -(depth - bevel))
  return geometry
}

/** A flat rounded rectangle, centred, with UVs stretched over 0..1 so a texture fills it. */
export function createRoundedPlane(width: number, height: number, radius: number): ShapeGeometry {
  const geometry = new ShapeGeometry(roundedRectShape(width, height, radius), CURVE_SEGMENTS)
  const position = geometry.getAttribute('position')
  const uv = geometry.getAttribute('uv')
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (position.getX(i) + width / 2) / width, (position.getY(i) + height / 2) / height)
  }
  uv.needsUpdate = true
  return geometry
}

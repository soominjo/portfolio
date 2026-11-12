export interface EdgeShiftInput {
  /** Horizontal centre of the anchor, in viewport pixels. */
  readonly center: number
  /** Half the tooltip's width. */
  readonly halfWidth: number
  readonly viewportWidth: number
  /** Gap to keep between the tooltip and either screen edge. */
  readonly margin: number
}

/**
 * How far (px) to slide a tooltip centred on its anchor so it stays on screen.
 * A tooltip wider than the screen keeps its start visible.
 */
export function edgeShift({ center, halfWidth, viewportWidth, margin }: EdgeShiftInput): number {
  const left = center - halfWidth
  const right = center + halfWidth

  if (left < margin) return margin - left
  if (right > viewportWidth - margin) return viewportWidth - margin - right
  return 0
}

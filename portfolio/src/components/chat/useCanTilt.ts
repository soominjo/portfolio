import { useMediaQuery } from '../../hooks/useMediaQuery'

/** Tilting needs a hover-capable fine pointer and room; touch and narrow screens face straight on. */
export const TILT_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 640px)'

export function useCanTilt(): boolean {
  return useMediaQuery(TILT_QUERY)
}

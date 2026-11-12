import { useSyncExternalStore } from 'react'

/** Tilting needs a hover-capable fine pointer and room; touch and narrow screens face straight on. */
export const TILT_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 640px)'

function tiltQuery(): MediaQueryList | null {
  return typeof window.matchMedia === 'function' ? window.matchMedia(TILT_QUERY) : null
}

function subscribe(onChange: () => void): () => void {
  const query = tiltQuery()
  if (!query) return () => {}
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return tiltQuery()?.matches ?? false
}

function getServerSnapshot(): boolean {
  return false
}

export function useCanTilt(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

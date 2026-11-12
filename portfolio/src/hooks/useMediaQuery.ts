import { useCallback, useMemo, useSyncExternalStore } from 'react'

function getServerSnapshot(): boolean {
  return false
}

/**
 * Whether a CSS media query matches, updated whenever it changes.
 * False where matchMedia is missing (jsdom) and on the server.
 */
export function useMediaQuery(query: string): boolean {
  const list = useMemo(
    () => (typeof window.matchMedia === 'function' ? window.matchMedia(query) : null),
    [query],
  )
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!list) return () => {}
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [list],
  )
  const getSnapshot = useCallback(() => list?.matches ?? false, [list])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

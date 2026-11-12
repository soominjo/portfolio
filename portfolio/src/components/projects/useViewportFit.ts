import { useSyncExternalStore } from 'react'

/** How much height the pinned showcase has to work with. */
export type ViewportFit = 'regular' | 'compact' | 'tiny'

// Phones in Safari with their toolbars showing are about 550–670px tall;
// phones held sideways are about 340px.
export const COMPACT_QUERY = '(max-height: 720px)'
export const TINY_QUERY = '(max-height: 480px)'

export function viewportFit(compact: boolean, tiny: boolean): ViewportFit {
  if (tiny) return 'tiny'
  return compact ? 'compact' : 'regular'
}

function canQuery(): boolean {
  return typeof window.matchMedia === 'function'
}

function subscribe(onChange: () => void): () => void {
  if (!canQuery()) return () => {}
  const lists = [COMPACT_QUERY, TINY_QUERY].map((query) => window.matchMedia(query))
  for (const list of lists) list.addEventListener('change', onChange)
  return () => {
    for (const list of lists) list.removeEventListener('change', onChange)
  }
}

function readFit(): ViewportFit {
  if (!canQuery()) return 'regular'
  return viewportFit(window.matchMedia(COMPACT_QUERY).matches, window.matchMedia(TINY_QUERY).matches)
}

/** The showcase's fit for the current window height, kept up to date as it changes. */
export function useViewportFit(): ViewportFit {
  return useSyncExternalStore(subscribe, readFit, () => 'regular')
}

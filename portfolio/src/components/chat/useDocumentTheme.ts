import { useSyncExternalStore } from 'react'
import type { Theme } from '../../hooks/useTheme'

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

function getServerSnapshot(): Theme {
  return 'dark'
}

/**
 * The site theme, read from the `.light` class that useTheme puts on <html>,
 * so the chat can follow it without App passing it down.
 */
export function useDocumentTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

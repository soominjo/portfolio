import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

/** What the app keeps in a history entry. */
interface RouteState {
  /**
   * The page load that pushed this entry. Back stays inside the site only for
   * entries this load pushed: after a refresh the entry keeps its state, but
   * the page before it belongs to the old document, and going there reloads.
   */
  readonly inApp?: string
  /** Where the page was scrolled when the visitor left it. */
  readonly scrollY?: number
}

const PAGE_LOAD_ID = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : String(Math.random())

// index.css switches off the browser's own view-transition animation (the theme
// toggle draws a wipe instead), so the page switch draws its own cross-fade.
const CROSS_FADE: KeyframeAnimationOptions = { duration: 250, easing: 'ease' }

function crossFade(): void {
  const root = document.documentElement
  root.animate({ opacity: [1, 0] }, { ...CROSS_FADE, pseudoElement: '::view-transition-old(root)' })
  root.animate({ opacity: [0, 1] }, { ...CROSS_FADE, pseudoElement: '::view-transition-new(root)' })
}

const listeners = new Set<() => void>()

function notify(): void {
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) window.addEventListener('popstate', notify)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('popstate', notify)
  }
}

function getPath(): string {
  return window.location.pathname
}

function currentState(): RouteState | null {
  const state: unknown = history.state
  return state !== null && typeof state === 'object' ? (state as RouteState) : null
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/** The current path, kept in step with `navigate` and the browser's Back and Forward. */
export function useRoute(): string {
  return useSyncExternalStore(subscribe, getPath)
}

/**
 * Switches page without reloading. The page being left remembers its scroll
 * position, and the swap cross-fades where view transitions are supported
 * and motion is allowed.
 */
export function navigate(to: string): void {
  history.replaceState({ ...currentState(), scrollY: window.scrollY }, '')

  const update = (): void => {
    flushSync(() => {
      history.pushState({ inApp: PAGE_LOAD_ID }, '', to)
      notify()
    })
  }

  if (!document.startViewTransition || prefersReducedMotion()) {
    update()
    return
  }
  document
    .startViewTransition(update)
    .ready.then(crossFade)
    .catch(() => {
      // Skipped (hidden tab, or superseded): the page already switched; there's nothing to fade.
    })
}

/**
 * Goes back when the current page was opened from inside the site, so the
 * browser's own Back stays in step. After a direct visit there is nothing to
 * go back to, so it navigates to `fallback` instead.
 */
export function goBackOr(fallback: string): void {
  if (currentState()?.inApp === PAGE_LOAD_ID) {
    history.back()
    return
  }
  navigate(fallback)
}

/**
 * True for a plain left click. Links switch pages in-app only then;
 * Ctrl-, ⌘-, Shift-, Alt- and middle-clicks keep the browser's own behaviour.
 */
export function isPlainLeftClick(event: Pick<MouseEvent, 'button' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

/** The scroll position saved in the current history entry, if any. */
export function savedScrollY(): number | null {
  const scrollY = currentState()?.scrollY
  return typeof scrollY === 'number' ? scrollY : null
}

import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { intersection, reducedMotion } from './controls'

// framer-motion caches the reduced-motion media query module-wide, so tests
// steer the hook directly instead of faking matchMedia.
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<typeof import('framer-motion')>()
  const controls = await import('./controls')
  return { ...actual, useReducedMotion: () => controls.reducedMotion.value }
})

// jsdom has no IntersectionObserver. This stub reports one entry per observed
// element, using `intersection.byId[element.id]` if set, else
// `intersection.isIntersecting`, as they were when observe() ran.
class IntersectionObserverStub {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds: readonly number[] = [0]
  private readonly callback: IntersectionObserverCallback
  private disconnected = false

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    const isIntersecting = intersection.byId[target.id] ?? intersection.isIntersecting
    queueMicrotask(() => {
      if (this.disconnected) return
      const entry = { isIntersecting, target } as IntersectionObserverEntry
      this.callback([entry], this as unknown as IntersectionObserver)
    })
  }

  unobserve(): void {}

  disconnect(): void {
    this.disconnected = true
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(window, 'IntersectionObserver', {
  configurable: true,
  writable: true,
  value: IntersectionObserverStub,
})

// jsdom has no WebGL; returning null mirrors a browser without it and keeps
// jsdom's "not implemented" noise out of the test output.
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => null,
})

afterEach(() => {
  cleanup()
  reducedMotion.value = false
  intersection.isIntersecting = false
  intersection.byId = {}
})

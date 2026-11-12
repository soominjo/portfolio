import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from './useMediaQuery'

type ChangeListener = (event: MediaQueryListEvent) => void

const QUERY = '(hover: hover) and (pointer: fine)'

// A matchMedia whose answer the test can change, counting live listeners.
function stubMatchMedia(initial: boolean) {
  const listeners = new Set<ChangeListener>()
  let matches = initial
  const matchMedia = vi.fn((media: string) => ({
    get matches() {
      return matches
    },
    media,
    addEventListener: (_type: 'change', listener: ChangeListener) => listeners.add(listener),
    removeEventListener: (_type: 'change', listener: ChangeListener) => listeners.delete(listener),
  }))
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    matchMedia,
    listeners,
    change(next: boolean) {
      matches = next
      listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent))
    },
  }
}

describe('useMediaQuery', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is false when matchMedia is unavailable', () => {
    expect(renderHook(() => useMediaQuery(QUERY)).result.current).toBe(false)
  })

  it('reports whether the query matches', () => {
    const media = stubMatchMedia(true)
    expect(renderHook(() => useMediaQuery(QUERY)).result.current).toBe(true)
    expect(media.matchMedia).toHaveBeenCalledWith(QUERY)
  })

  it('follows changes to the query', () => {
    const media = stubMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery(QUERY))
    act(() => media.change(true))
    expect(result.current).toBe(true)
  })

  it('creates one media query list per query, not one per render', () => {
    const media = stubMatchMedia(true)
    const { rerender } = renderHook(() => useMediaQuery(QUERY))
    rerender()
    rerender()
    expect(media.matchMedia).toHaveBeenCalledTimes(1)
  })

  it('stops listening once unmounted', () => {
    const media = stubMatchMedia(true)
    const { unmount } = renderHook(() => useMediaQuery(QUERY))
    expect(media.listeners.size).toBeGreaterThan(0)
    unmount()
    expect(media.listeners.size).toBe(0)
  })
})

import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TILT_QUERY, useCanTilt } from './useCanTilt'

type ChangeListener = (event: MediaQueryListEvent) => void

// A MediaQueryList whose answer the test can change.
function stubMatchMedia(initial: boolean) {
  const listeners = new Set<ChangeListener>()
  const list = {
    matches: initial,
    media: TILT_QUERY,
    addEventListener: (_type: 'change', listener: ChangeListener) => listeners.add(listener),
    removeEventListener: (_type: 'change', listener: ChangeListener) => listeners.delete(listener),
  }
  const matchMedia = vi.fn(() => list)
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    matchMedia,
    change(matches: boolean) {
      list.matches = matches
      listeners.forEach((listener) => listener({ matches } as MediaQueryListEvent))
    },
  }
}

describe('useCanTilt', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('stays flat when matchMedia is unavailable', () => {
    expect(renderHook(() => useCanTilt()).result.current).toBe(false)
  })

  it('tilts on a fine pointer with hover', () => {
    const media = stubMatchMedia(true)
    expect(renderHook(() => useCanTilt()).result.current).toBe(true)
    expect(media.matchMedia).toHaveBeenCalledWith(TILT_QUERY)
  })

  it('follows changes to the media query', () => {
    const media = stubMatchMedia(true)
    const { result } = renderHook(() => useCanTilt())
    act(() => media.change(false))
    expect(result.current).toBe(false)
  })
})

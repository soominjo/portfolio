import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { goBackOr, navigate, savedScrollY, useRoute } from './useRoute'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, 'startViewTransition')
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  history.replaceState(null, '', '/')
})

describe('useRoute', () => {
  it('re-renders with the new path after navigate', () => {
    const { result } = renderHook(() => useRoute())
    expect(result.current).toBe('/')
    act(() => navigate('/contact'))
    expect(result.current).toBe('/contact')
    expect(window.location.pathname).toBe('/contact')
  })

  it('follows Back and Forward', () => {
    const { result } = renderHook(() => useRoute())
    act(() => {
      history.pushState(null, '', '/contact')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current).toBe('/contact')
  })

  it('saves the scroll position of the page it leaves', () => {
    Object.defineProperty(window, 'scrollY', { value: 1234, configurable: true })
    const replace = vi.spyOn(history, 'replaceState')
    navigate('/contact')
    expect(replace).toHaveBeenCalledWith(expect.objectContaining({ scrollY: 1234 }), '')
  })

  it('reads a saved scroll position back', () => {
    history.replaceState({ scrollY: 560 }, '', '/')
    expect(savedScrollY()).toBe(560)
    history.replaceState(null, '', '/')
    expect(savedScrollY()).toBeNull()
  })

  it('goes back in history when the page was opened in-app', () => {
    const back = vi.spyOn(history, 'back').mockImplementation(() => {})
    navigate('/contact')
    goBackOr('/#contact')
    expect(back).toHaveBeenCalledTimes(1)
  })

  it('navigates to the fallback after a direct visit', () => {
    history.replaceState(null, '', '/contact')
    const back = vi.spyOn(history, 'back')
    goBackOr('/#contact')
    expect(back).not.toHaveBeenCalled()
    expect(window.location.pathname + window.location.hash).toBe('/#contact')
  })

  // After a refresh the entry keeps its state, but the page it would go Back
  // to belongs to the old document, so history.back() would reload the site.
  it('navigates to the fallback when the in-app mark is from an earlier page load', () => {
    history.replaceState({ inApp: true }, '', '/contact')
    const back = vi.spyOn(history, 'back')
    goBackOr('/#contact')
    expect(back).not.toHaveBeenCalled()
    expect(window.location.pathname + window.location.hash).toBe('/#contact')
  })

  // index.css turns off the browser's default view-transition animation for the
  // theme wipe, so the page switch has to draw its own cross-fade.
  it('cross-fades the old and new page during the view transition', async () => {
    const start = vi.fn((update: () => void) => {
      update()
      return { ready: Promise.resolve(), finished: Promise.resolve(), updateCallbackDone: Promise.resolve() }
    })
    Object.assign(document, { startViewTransition: start })
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    const animate = vi.fn()
    Object.assign(document.documentElement, { animate })

    navigate('/contact')
    await Promise.resolve()

    expect(animate).toHaveBeenCalledWith(
      { opacity: [1, 0] },
      expect.objectContaining({ pseudoElement: '::view-transition-old(root)' }),
    )
    expect(animate).toHaveBeenCalledWith(
      { opacity: [0, 1] },
      expect.objectContaining({ pseudoElement: '::view-transition-new(root)' }),
    )
    Reflect.deleteProperty(document.documentElement, 'animate')
  })

  it('switches inside a view transition when motion is allowed', () => {
    const start = vi.fn((update: () => void) => {
      update()
      return { ready: Promise.resolve(), finished: Promise.resolve(), updateCallbackDone: Promise.resolve() }
    })
    Object.assign(document, { startViewTransition: start })
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    navigate('/contact')
    expect(start).toHaveBeenCalledTimes(1)
    expect(window.location.pathname).toBe('/contact')
  })

  it('skips the view transition under reduced motion', () => {
    const start = vi.fn()
    Object.assign(document, { startViewTransition: start })
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    navigate('/contact')
    expect(start).not.toHaveBeenCalled()
    expect(window.location.pathname).toBe('/contact')
  })
})

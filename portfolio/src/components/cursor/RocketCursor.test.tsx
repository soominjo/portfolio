import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { EXHAUST_QUERY, ROCKET_CURSOR_CLASS, ROCKET_CURSOR_QUERY } from './cursorRules'
import { startExhaust } from './exhaustEngine'
import { RocketCursor } from './RocketCursor'

// The engine draws on a real canvas and has its own tests; here only the wiring matters.
vi.mock('./exhaustEngine', () => ({
  startExhaust: vi.fn(() => ({ dispose: vi.fn() })),
}))

type ChangeListener = (event: MediaQueryListEvent) => void

// matchMedia with an answer per query that the test can change later.
function stubMatchMedia(answers: Record<string, boolean>) {
  const state: Record<string, boolean> = { ...answers }
  const listeners = new Map<string, Set<ChangeListener>>()
  const matchMedia = vi.fn((media: string) => ({
    get matches() {
      return state[media] ?? false
    },
    media,
    addEventListener: (_type: 'change', listener: ChangeListener) => {
      listeners.set(media, new Set([...(listeners.get(media) ?? []), listener]))
    },
    removeEventListener: (_type: 'change', listener: ChangeListener) => {
      listeners.get(media)?.delete(listener)
    },
  }))
  vi.stubGlobal('matchMedia', matchMedia)
  return {
    matchMedia,
    change(media: string, matches: boolean) {
      state[media] = matches
      listeners.get(media)?.forEach((listener) => listener({ matches, media } as MediaQueryListEvent))
    },
  }
}

// Records what each `new Image()` is asked to load.
function stubImages(): string[] {
  const requested: string[] = []
  vi.stubGlobal(
    'Image',
    class {
      set srcset(value: string) {
        requested.push(value)
      }
    },
  )
  return requested
}

const MOUSE_SCREEN = { [ROCKET_CURSOR_QUERY]: true, [EXHAUST_QUERY]: true }

describe('RocketCursor', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('turns the rocket cursor on for the page, and off again when it unmounts', () => {
    const { unmount } = render(<RocketCursor theme="dark" />)
    expect(document.documentElement).toHaveClass(ROCKET_CURSOR_CLASS)
    unmount()
    expect(document.documentElement).not.toHaveClass(ROCKET_CURSOR_CLASS)
  })

  it('draws no exhaust where matchMedia is missing', () => {
    render(<RocketCursor theme="dark" />)
    expect(screen.queryByTestId('rocket-exhaust')).not.toBeInTheDocument()
    expect(startExhaust).not.toHaveBeenCalled()
  })

  it('draws no exhaust on touch screens', () => {
    stubMatchMedia({})
    render(<RocketCursor theme="dark" />)
    expect(screen.queryByTestId('rocket-exhaust')).not.toBeInTheDocument()
    expect(startExhaust).not.toHaveBeenCalled()
  })

  it('keeps the exhaust off when motion is reduced', () => {
    const media = stubMatchMedia({ [ROCKET_CURSOR_QUERY]: true })
    render(<RocketCursor theme="dark" />)
    expect(media.matchMedia).toHaveBeenCalledWith(EXHAUST_QUERY)
    expect(screen.queryByTestId('rocket-exhaust')).not.toBeInTheDocument()
    expect(startExhaust).not.toHaveBeenCalled()
  })

  it('starts the exhaust on mouse screens, on a hidden canvas that clicks pass through', () => {
    stubMatchMedia(MOUSE_SCREEN)
    render(<RocketCursor theme="dark" />)
    const canvas = screen.getByTestId('rocket-exhaust')
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(canvas).toHaveClass('pointer-events-none', 'fixed', 'inset-0')
    expect(canvas.parentElement).toBe(document.body)
    expect(startExhaust).toHaveBeenCalledWith(canvas, expect.objectContaining({ getTheme: expect.any(Function) }))
  })

  it('gives the exhaust the current theme without restarting it', () => {
    stubMatchMedia(MOUSE_SCREEN)
    const { rerender } = render(<RocketCursor theme="dark" />)
    const { getTheme } = vi.mocked(startExhaust).mock.calls[0][1]
    expect(getTheme()).toBe('dark')
    rerender(<RocketCursor theme="light" />)
    expect(getTheme()).toBe('light')
    expect(startExhaust).toHaveBeenCalledTimes(1)
  })

  it('stops the exhaust when it unmounts', () => {
    stubMatchMedia(MOUSE_SCREEN)
    const { unmount } = render(<RocketCursor theme="dark" />)
    const engine = vi.mocked(startExhaust).mock.results[0].value as { dispose: () => void }
    unmount()
    expect(engine.dispose).toHaveBeenCalled()
  })

  it('stops the exhaust and drops its canvas if reduced motion is switched on mid-visit', () => {
    const media = stubMatchMedia(MOUSE_SCREEN)
    render(<RocketCursor theme="dark" />)
    const engine = vi.mocked(startExhaust).mock.results[0].value as { dispose: () => void }
    act(() => media.change(EXHAUST_QUERY, false))
    expect(engine.dispose).toHaveBeenCalled()
    expect(screen.queryByTestId('rocket-exhaust')).not.toBeInTheDocument()
  })

  it('fetches the lit rocket before the first hover, at the right density for the screen', () => {
    stubMatchMedia(MOUSE_SCREEN)
    const requested = stubImages()
    render(<RocketCursor theme="dark" />)
    expect(requested).toHaveLength(1)
    expect(requested[0]).toMatch(/rocket-lit\.png 1x, \S*rocket-lit@2x\.png 2x$/)
  })

  it('fetches nothing extra on touch screens', () => {
    stubMatchMedia({})
    const requested = stubImages()
    render(<RocketCursor theme="dark" />)
    expect(requested).toEqual([])
  })
})

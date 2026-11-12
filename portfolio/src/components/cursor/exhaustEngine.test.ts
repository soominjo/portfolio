import { fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Theme } from '../../hooks/useTheme'
import { startExhaust } from './exhaustEngine'

const mouse = { pointerType: 'mouse' }

// Just enough of a 2D context to see what gets drawn.
function fakeContext() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '',
  }
}

interface SetupOptions {
  theme?: Theme
  /** The canvas's CSS box. jsdom has no layout, so it is 0 unless given. */
  box?: { width: number; height: number }
}

function setup({ theme = 'dark', box }: SetupOptions = {}) {
  const canvas = document.createElement('canvas')
  const ctx = fakeContext()
  Object.defineProperty(canvas, 'getContext', { value: () => ctx })
  if (box) {
    Object.defineProperty(canvas, 'clientWidth', { value: box.width })
    Object.defineProperty(canvas, 'clientHeight', { value: box.height })
  }
  document.body.appendChild(canvas)
  const engine = startExhaust(canvas, { getTheme: () => theme, random: () => 0.5 })
  return { canvas, ctx, engine }
}

// Two moves over `target`: the second flies 40px to the right of the first.
function fly(target: Element = document.body, pointer = mouse, fromX = 100): void {
  fireEvent.pointerMove(target, { ...pointer, clientX: fromX, clientY: 100 })
  fireEvent.pointerMove(target, { ...pointer, clientX: fromX + 40, clientY: 100 })
}

function place(html: string): HTMLElement {
  const holder = document.createElement('div')
  holder.innerHTML = html
  document.body.appendChild(holder)
  return holder.firstElementChild as HTMLElement
}

describe('startExhaust', () => {
  let stop: (() => void) | undefined

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
  })

  afterEach(() => {
    stop?.()
    stop = undefined
    vi.useRealTimers()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('does nothing without a 2D canvas', () => {
    const canvas = document.createElement('canvas')
    expect(startExhaust(canvas, { getTheme: () => 'dark' })).toBeNull()
  })

  describe('canvas size', () => {
    it('covers the window, at no more than twice its pixel density', () => {
      vi.stubGlobal('devicePixelRatio', 3)
      const { canvas, engine } = setup()
      stop = engine?.dispose
      expect(canvas.width).toBe(window.innerWidth * 2)
      expect(canvas.height).toBe(window.innerHeight * 2)
    })

    it('matches its own box, which leaves out the page scrollbar', () => {
      vi.stubGlobal('devicePixelRatio', 2)
      const { canvas, engine } = setup({ box: { width: 1009, height: 700 } })
      stop = engine?.dispose
      expect(canvas.width).toBe(2018)
      expect(canvas.height).toBe(1400)
    })

    it('follows the window when it resizes', () => {
      const { canvas, engine } = setup()
      stop = engine?.dispose
      vi.stubGlobal('innerWidth', 800)
      vi.stubGlobal('innerHeight', 600)
      window.dispatchEvent(new Event('resize'))
      expect(canvas.width).toBe(800)
      expect(canvas.height).toBe(600)
    })
  })

  describe('flight', () => {
    it('trails exhaust behind a moving mouse', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      fly()
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).toHaveBeenCalled()
    })

    it('ignores touch and pen', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      fly(document.body, { pointerType: 'touch' })
      fly(document.body, { pointerType: 'pen' })
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).not.toHaveBeenCalled()
    })

    it('burns denser over links and buttons', () => {
      const puffs = (target: Element) => {
        const { ctx, engine } = setup()
        fly(target)
        vi.advanceTimersToNextFrame()
        engine?.dispose()
        return ctx.arc.mock.calls.length
      }
      const plain = puffs(document.body)
      const lit = puffs(place('<button type="button">Go</button>'))
      expect(plain).toBeGreaterThan(0)
      expect(lit).toBeGreaterThan(plain)
    })

    it.each([
      ['a text field, where the cursor is an I-beam', '<input type="text" />'],
      ['a disabled control', '<button type="button" disabled>Send</button>'],
    ])('leaves no exhaust over %s', (_where, html) => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      fly(place(html))
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).not.toHaveBeenCalled()
    })

    it('leaves no exhaust inside an open dialog, which covers the canvas', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      const close = place('<dialog open><button type="button">Close</button></dialog>').querySelector('button')
      fly(close as HTMLButtonElement)
      fireEvent.pointerDown(close as HTMLButtonElement, { ...mouse, button: 0, clientX: 140, clientY: 100 })
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).not.toHaveBeenCalled()
    })

    it('leaves no exhaust over the page scrollbar', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      const x = window.innerWidth + 4
      fireEvent.pointerMove(document.body, { ...mouse, clientX: x, clientY: 100 })
      fireEvent.pointerMove(document.body, { ...mouse, clientX: x, clientY: 160 })
      fireEvent.pointerDown(document.body, { ...mouse, button: 0, clientX: x, clientY: 160 })
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).not.toHaveBeenCalled()
    })

    it('leaves no streak when the pointer comes back after leaving the window', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      fireEvent.pointerMove(document.body, { ...mouse, clientX: 100, clientY: 100 })
      window.dispatchEvent(new Event('blur'))
      fireEvent.pointerMove(document.body, { ...mouse, clientX: 200, clientY: 100 })
      fireEvent.pointerLeave(document.documentElement, mouse)
      fireEvent.pointerMove(document.body, { ...mouse, clientX: 20, clientY: 100 })
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).not.toHaveBeenCalled()
    })
  })

  describe('boost', () => {
    it('fires a boost when the mouse is pressed', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      fireEvent.pointerDown(document.body, { ...mouse, button: 0, clientX: 50, clientY: 50 })
      vi.advanceTimersToNextFrame()
      expect(ctx.arc.mock.calls.length).toBeGreaterThanOrEqual(20)
    })

    it('ignores the right and middle buttons', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      fireEvent.pointerDown(document.body, { ...mouse, button: 2, clientX: 50, clientY: 50 })
      fireEvent.pointerDown(document.body, { ...mouse, button: 1, clientX: 50, clientY: 50 })
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).not.toHaveBeenCalled()
    })
  })

  it('glows additively on the dark page and blends normally on the light page', () => {
    const dark = setup({ theme: 'dark' })
    fly()
    vi.advanceTimersToNextFrame()
    expect(dark.ctx.globalCompositeOperation).toBe('lighter')
    dark.engine?.dispose()

    const light = setup({ theme: 'light' })
    stop = light.engine?.dispose
    fly()
    vi.advanceTimersToNextFrame()
    expect(light.ctx.globalCompositeOperation).toBe('source-over')
  })

  describe('frames', () => {
    it('stays hidden while idle and shows only while exhaust burns', () => {
      const { canvas, engine } = setup()
      stop = engine?.dispose
      expect(canvas.style.visibility).toBe('hidden')
      fly()
      expect(canvas.style.visibility).toBe('visible')
      vi.advanceTimersByTime(3000)
      expect(canvas.style.visibility).toBe('hidden')
    })

    it('stops asking for frames once the exhaust burns out', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      fly()
      vi.advanceTimersByTime(3000)
      ctx.arc.mockClear()
      vi.advanceTimersByTime(200)
      expect(ctx.arc).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
    })

    it('starts again when the mouse moves after burning out', () => {
      const { ctx, engine } = setup()
      stop = engine?.dispose
      fly()
      vi.advanceTimersByTime(3000)
      ctx.arc.mockClear()
      fly(document.body, mouse, 160)
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).toHaveBeenCalled()
    })

    it('stops listening once disposed', () => {
      const { ctx, engine } = setup()
      fly()
      vi.advanceTimersToNextFrame()
      expect(ctx.arc).toHaveBeenCalled()

      engine?.dispose()
      ctx.arc.mockClear()
      fly(document.body, mouse, 160)
      fireEvent.pointerDown(document.body, { ...mouse, button: 0, clientX: 50, clientY: 50 })
      vi.advanceTimersByTime(100)
      expect(ctx.arc).not.toHaveBeenCalled()
    })
  })
})

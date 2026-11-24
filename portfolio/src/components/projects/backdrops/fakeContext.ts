// Test helper: a stand-in 2D context that records what is drawn. jsdom has
// no canvas, and the backdrops only need to know that drawing happened and
// that each scene leaves the context the way it found it.

export interface FakeContext {
  readonly ctx: CanvasRenderingContext2D
  /** Names of the drawing methods called, in order. */
  readonly calls: string[]
  /** Every string passed to fillText. */
  readonly texts: string[]
  readonly count: (method: string) => number
  readonly lineDash: () => readonly number[]
}

const INITIAL_STATE: Readonly<Record<string, unknown>> = {
  fillStyle: '#000',
  strokeStyle: '#000',
  lineWidth: 1,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  lineCap: 'butt',
  lineJoin: 'miter',
  lineDashOffset: 0,
  letterSpacing: '0px',
}

export function fakeContext(canvas: unknown = null): FakeContext {
  const calls: string[] = []
  const texts: string[] = []
  const state: Record<string | symbol, unknown> = { ...INITIAL_STATE }
  const saved: Record<string | symbol, unknown>[] = []
  let dash: readonly number[] = []
  const gradient = { addColorStop: () => undefined }

  const special: Record<string, (...args: never[]) => unknown> = {
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: (text: string) => ({ width: text.length * 6 }),
    getLineDash: () => [...dash],
    setLineDash: (next: readonly number[]) => {
      dash = [...next]
    },
    fillText: (text: string) => {
      texts.push(text)
    },
    save: () => {
      saved.push({ ...state })
    },
    restore: () => {
      const previous = saved.pop()
      if (previous) Object.assign(state, previous)
    },
  }

  const ctx = new Proxy(state, {
    get(target, prop) {
      if (prop === 'canvas') return canvas
      if (typeof prop === 'string' && prop in special) {
        return (...args: never[]) => {
          calls.push(prop)
          return special[prop](...args)
        }
      }
      if (prop in target) return target[prop]
      return () => {
        calls.push(String(prop))
      }
    },
    set(target, prop, value) {
      target[prop] = value
      return true
    },
    has: () => true,
  }) as unknown as CanvasRenderingContext2D

  return {
    ctx,
    calls,
    texts,
    count: (method) => calls.filter((name) => name === method).length,
    lineDash: () => dash,
  }
}

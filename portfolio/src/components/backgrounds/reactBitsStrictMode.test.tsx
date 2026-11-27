import { render } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Particles from './react-bits/Particles'

interface FakeWebGl {
  gl: WebGL2RenderingContext
  loseContext: ReturnType<typeof vi.fn>
}

// A WebGL2 context that accepts every call: methods return a handle, enums
// are 0 and compile/link checks pass. Only context loss is tracked for real.
function createFakeWebGl(): FakeWebGl {
  let lost = false
  const loseContext = vi.fn(() => {
    lost = true
  })
  const handle = (): object => ({})
  const special: Record<string, unknown> = {
    getExtension: (name: string) =>
      name === 'WEBGL_lose_context' ? { loseContext, restoreContext: () => {} } : null,
    isContextLost: () => lost,
    getContextAttributes: () => (lost ? null : { alpha: true }),
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getParameter: () => 0,
    getError: () => 0,
    checkFramebufferStatus: () => 0,
    getSupportedExtensions: () => [],
    getAttribLocation: () => 0,
    getActiveUniform: () => ({ name: 'uFake', size: 1, type: 0 }),
    getActiveAttrib: () => ({ name: 'aFake', size: 1, type: 0 }),
    drawingBufferWidth: 300,
    drawingBufferHeight: 150,
  }
  const gl = new Proxy(
    {},
    {
      get(_target, prop) {
        if (typeof prop !== 'string') return undefined
        if (prop in special) return special[prop]
        if (/^[A-Z0-9_]+$/.test(prop)) return 0
        return handle
      },
    },
  )
  return { gl: gl as WebGL2RenderingContext, loseContext }
}

// The colour probe the particles use to turn CSS colours into RGB.
function createFake2d(): object {
  return {
    clearRect: () => {},
    fillRect: () => {},
    fillStyle: '#000000',
    getImageData: () => ({ data: new Uint8ClampedArray([0, 0, 0, 255]) }),
  }
}

function installFakeWebGl(): FakeWebGl {
  const fake = createFakeWebGl()
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(((type: string) => {
    if (type === 'webgl2') return fake.gl
    if (type === '2d') return createFake2d()
    return null
  }) as unknown as HTMLCanvasElement['getContext'])
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  )
  return fake
}

// StrictMode mounts, unmounts and remounts every effect in development. A
// background that loses its context in that cleanup comes back on a dead
// context and draws an opaque white layer over the hero.
describe('React Bits particles under StrictMode', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('keeps their WebGL context through the dev remount', () => {
    // Frames are faked so a release deferred to the next frame actually fires.
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] })
    const { loseContext } = installFakeWebGl()
    const { unmount } = render(
      <StrictMode>
        <Particles />
      </StrictMode>,
    )
    vi.advanceTimersToNextFrame()
    expect(loseContext).not.toHaveBeenCalled()

    unmount()
    vi.advanceTimersToNextFrame()
    expect(loseContext).toHaveBeenCalledTimes(1)
  })
})

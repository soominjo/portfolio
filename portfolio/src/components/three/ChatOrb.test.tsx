import { act, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reducedMotion } from '../../test/controls'
import ChatOrb from './ChatOrb'
import { createChatOrbScene, type ChatOrbScene } from './chatOrbScene'

// The scene needs WebGL; the component's job is wiring, so the scene is
// replaced with spies and the rest of the module (getOrbLean) stays real.
vi.mock('./chatOrbScene', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./chatOrbScene')>()
  return { ...actual, createChatOrbScene: vi.fn() }
})

// Lets a few animation frames land, so "no tick" assertions can't pass just
// because nothing has run yet.
function settle() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
  })
}

function createFakeOrb(): ChatOrbScene {
  return {
    scene: {} as ChatOrbScene['scene'],
    setTheme: vi.fn(),
    resize: vi.fn(),
    tick: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  }
}

describe('ChatOrb', () => {
  let fake: ChatOrbScene

  beforeEach(() => {
    fake = createFakeOrb()
    vi.mocked(createChatOrbScene).mockReset().mockReturnValue(fake)
  })

  afterEach(() => {
    delete (document as { hidden?: boolean }).hidden
  })

  it('renders nothing and never reports ready without WebGL', async () => {
    vi.mocked(createChatOrbScene).mockReturnValue(null)
    const onReady = vi.fn()
    const { container } = render(<ChatOrb theme="dark" paused={false} onReady={onReady} />)
    await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
    expect(onReady).not.toHaveBeenCalled()
  })

  it('lights the orb before its first frame, then reports ready once', () => {
    const onReady = vi.fn()
    render(<ChatOrb theme="dark" paused={false} onReady={onReady} />)
    expect(vi.mocked(fake.setTheme).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(fake.render).mock.invocationCallOrder[0],
    )
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('sizes the drawing buffer to the canvas', () => {
    render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
    expect(fake.resize).toHaveBeenCalledWith(72, 1)
  })

  it('animates while the chat is closed', async () => {
    render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
    await waitFor(() => expect(fake.tick).toHaveBeenCalled())
  })

  it('stops animating while the chat is open', async () => {
    render(<ChatOrb theme="dark" paused onReady={vi.fn()} />)
    await settle()
    expect(fake.tick).not.toHaveBeenCalled()
  })

  it('draws one still frame under reduced motion', async () => {
    reducedMotion.value = true
    render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
    await settle()
    expect(fake.render).toHaveBeenCalled()
    expect(fake.tick).not.toHaveBeenCalled()
  })

  it('pauses while the tab is hidden', async () => {
    render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
    await waitFor(() => expect(fake.tick).toHaveBeenCalled())
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    const ticks = vi.mocked(fake.tick).mock.calls.length
    await settle()
    expect(vi.mocked(fake.tick).mock.calls.length).toBe(ticks)
  })

  it('swaps lights on theme change without rebuilding', () => {
    const { rerender } = render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
    rerender(<ChatOrb theme="light" paused={false} onReady={vi.fn()} />)
    expect(createChatOrbScene).toHaveBeenCalledTimes(1)
    expect(fake.setTheme).toHaveBeenLastCalledWith('light')
  })

  it('disposes the scene on unmount', () => {
    const { unmount } = render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
    unmount()
    expect(fake.dispose).toHaveBeenCalled()
  })
})

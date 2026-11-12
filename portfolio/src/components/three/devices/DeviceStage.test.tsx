import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { intersection, reducedMotion } from '../../../test/controls'
import DeviceStage from './DeviceStage'
import { createDeviceScene, type DeviceScene } from './deviceScene'
import type { DeviceSlide } from './deviceTypes'

// The scene needs WebGL; the component's job is wiring, so the scene is
// replaced with spies and everything else in the module stays real.
vi.mock('./deviceScene', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./deviceScene')>()
  return { ...actual, createDeviceScene: vi.fn() }
})

// Lets IntersectionObserver callbacks and a few animation frames land.
function settle() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
  })
}

function slide(id: string, showPhone = true): DeviceSlide {
  return { id, label: id, desktopUrl: `/${id}.webp`, mobileUrl: null, showPhone, finish: 'silver', desktopFocusX: 0.5 }
}

const SLIDES = [slide('one'), slide('two', false), slide('three')]

function createFakeScene(): DeviceScene {
  return {
    scene: {} as DeviceScene['scene'],
    resize: vi.fn(),
    setSlide: vi.fn(),
    prefetch: vi.fn(),
    playIntro: vi.fn(),
    setPointer: vi.fn(),
    update: vi.fn(() => false),
    render: vi.fn(),
    dispose: vi.fn(),
  }
}

function stage(activeIndex = 0) {
  return <DeviceStage slides={SLIDES} activeIndex={activeIndex} fallback={<p>static screenshot</p>} />
}

describe('DeviceStage', () => {
  let fake: DeviceScene

  beforeEach(() => {
    fake = createFakeScene()
    vi.mocked(createDeviceScene).mockReset().mockReturnValue(fake)
  })

  it('renders the fallback when WebGL is unavailable', async () => {
    vi.mocked(createDeviceScene).mockReturnValue(null)
    render(stage())
    expect(await screen.findByText('static screenshot')).toBeInTheDocument()
    expect(document.querySelector('canvas')).toBeNull()
  })

  it('creates the scene once and disposes it on unmount', () => {
    const { rerender, unmount } = render(stage(0))
    rerender(stage(1))
    expect(createDeviceScene).toHaveBeenCalledTimes(1)
    unmount()
    expect(fake.dispose).toHaveBeenCalled()
  })

  it('shows the first slide at once, then animates later ones', () => {
    const { rerender } = render(stage(0))
    expect(fake.setSlide).toHaveBeenLastCalledWith(SLIDES[0], { immediate: true })
    rerender(stage(1))
    expect(fake.setSlide).toHaveBeenLastCalledWith(SLIDES[1], { immediate: false })
    expect(fake.prefetch).toHaveBeenLastCalledWith([SLIDES[2], SLIDES[0]])
  })

  it('swaps slides at once under reduced motion', () => {
    reducedMotion.value = true
    const { rerender } = render(stage(0))
    rerender(stage(1))
    expect(fake.setSlide).toHaveBeenLastCalledWith(SLIDES[1], { immediate: true })
  })

  it('waits to play the intro until the stage is in view', async () => {
    render(stage())
    await settle()
    expect(fake.playIntro).not.toHaveBeenCalled()
  })

  it('plays the intro once the stage is in view', async () => {
    intersection.isIntersecting = true
    render(stage())
    await waitFor(() => expect(fake.playIntro).toHaveBeenCalledWith({ immediate: false }))
    await settle()
    expect(fake.playIntro).toHaveBeenCalledTimes(1)
  })

  it('skips the intro animation under reduced motion', async () => {
    reducedMotion.value = true
    intersection.isIntersecting = true
    render(stage())
    await waitFor(() => expect(fake.playIntro).toHaveBeenCalledWith({ immediate: true }))
  })

  it('resizes the scene on window resize', () => {
    const { container } = render(stage())
    const box = container.firstElementChild as HTMLElement
    Object.defineProperty(box, 'clientWidth', { configurable: true, value: 640 })
    Object.defineProperty(box, 'clientHeight', { configurable: true, value: 400 })
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    expect(fake.resize).toHaveBeenLastCalledWith(640, 400)
  })

  it('leans toward the pointer while in view', async () => {
    intersection.isIntersecting = true
    render(stage())
    await settle()
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: window.innerWidth, clientY: window.innerHeight / 2 }))
    expect(fake.setPointer).toHaveBeenCalledWith(0.5, 0)
  })

  it('ignores the pointer under reduced motion', async () => {
    reducedMotion.value = true
    intersection.isIntersecting = true
    render(stage())
    await settle()
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 10, clientY: 10 }))
    expect(fake.setPointer).not.toHaveBeenCalled()
  })

  it('keeps drawing while the scene moves', async () => {
    intersection.isIntersecting = true
    vi.mocked(fake.update).mockReturnValue(true)
    render(stage())
    await settle()
    const drawn = vi.mocked(fake.render).mock.calls.length
    await settle()
    expect(vi.mocked(fake.render).mock.calls.length).toBeGreaterThan(drawn)
  })

  it('stops drawing once the scene is still', async () => {
    intersection.isIntersecting = true
    render(stage())
    // Under act, the in-view change commits as the first settle ends and
    // draws one more frame; let that land before taking the baseline.
    await settle()
    await settle()
    expect(fake.render).toHaveBeenCalled()
    const drawn = vi.mocked(fake.render).mock.calls.length
    await settle()
    expect(vi.mocked(fake.render).mock.calls.length).toBe(drawn)
  })
})

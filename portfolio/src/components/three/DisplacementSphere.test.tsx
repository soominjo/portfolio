import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { intersection, reducedMotion } from '../../test/controls'
import DisplacementSphere from './DisplacementSphere'
import { createSphereScene, type SphereScene } from './sphereScene'

// The scene itself needs WebGL; the component's job is wiring, so the scene
// is replaced with spies and everything else in the module stays real.
vi.mock('./sphereScene', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./sphereScene')>()
  return { ...actual, createSphereScene: vi.fn() }
})

// Lets the IntersectionObserver callback and a few animation frames land, so
// "no tick" assertions can't pass just because nothing has run yet.
function settle() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100))
  })
}

function createFakeScene(): SphereScene {
  return {
    scene: {} as SphereScene['scene'],
    setTheme: vi.fn(),
    resize: vi.fn(),
    tick: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
  }
}

describe('DisplacementSphere', () => {
  let fake: SphereScene

  beforeEach(() => {
    fake = createFakeScene()
    vi.mocked(createSphereScene).mockReset().mockReturnValue(fake)
  })

  it('renders nothing when WebGL is unavailable', async () => {
    vi.mocked(createSphereScene).mockReturnValue(null)
    const { container } = render(<DisplacementSphere theme="dark" />)
    await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
  })

  it('creates the scene once and swaps lights on theme change', () => {
    const { rerender } = render(<DisplacementSphere theme="dark" />)
    rerender(<DisplacementSphere theme="light" />)
    expect(createSphereScene).toHaveBeenCalledTimes(1)
    expect(fake.setTheme).toHaveBeenLastCalledWith('light')
  })

  it('disposes the scene on unmount', () => {
    const { unmount } = render(<DisplacementSphere theme="dark" />)
    unmount()
    expect(fake.dispose).toHaveBeenCalled()
  })

  it('draws one frame and starts no loop while off-screen', async () => {
    render(<DisplacementSphere theme="dark" />)
    await waitFor(() => expect(fake.render).toHaveBeenCalled())
    await settle()
    expect(fake.tick).not.toHaveBeenCalled()
  })

  it('draws one still frame when reduced motion is preferred, even on-screen', async () => {
    reducedMotion.value = true
    intersection.isIntersecting = true
    render(<DisplacementSphere theme="dark" />)
    await waitFor(() => expect(fake.render).toHaveBeenCalled())
    await settle()
    expect(fake.tick).not.toHaveBeenCalled()
  })

  it('lights the scene before drawing its first frame', () => {
    render(<DisplacementSphere theme="dark" />)
    const firstSetTheme = vi.mocked(fake.setTheme).mock.invocationCallOrder[0]
    const firstRender = vi.mocked(fake.render).mock.invocationCallOrder[0]
    expect(firstSetTheme).toBeLessThan(firstRender)
  })

  it('tones the sphere down on the light page', () => {
    render(<DisplacementSphere theme="light" />)
    expect(screen.getByTestId('sphere-layer')).toHaveStyle({ opacity: '0.35' })
  })

  it('keeps the sphere at full strength on the dark page', () => {
    render(<DisplacementSphere theme="dark" />)
    expect(screen.getByTestId('sphere-layer')).toHaveStyle({ opacity: '1' })
  })

  it('animates while on-screen', async () => {
    intersection.isIntersecting = true
    render(<DisplacementSphere theme="dark" />)
    await waitFor(() => expect(fake.tick).toHaveBeenCalled())
  })
})

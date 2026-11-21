import { render, screen } from '@testing-library/react'
import { createRef, StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { intersection } from '../../../test/controls'
import type { BackdropStage } from './backdropStage'
import { ProjectBackdrop } from './ProjectBackdrop'
import { PROJECT_BACKDROPS } from './projectBackdrops'

function fakeStage(): BackdropStage {
  return {
    show: vi.fn(),
    setLayout: vi.fn(),
    setTheme: vi.fn(),
    setMotion: vi.fn(),
    setOnScreen: vi.fn(),
    refresh: vi.fn(),
    dispose: vi.fn(),
  }
}

const createStage = vi.hoisted(() => vi.fn())
vi.mock('./backdropStage', () => ({ createBackdropStage: createStage }))

function box(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) } as DOMRect
}

function cellAt(rect: DOMRect) {
  const cell = document.createElement('div')
  cell.getBoundingClientRect = () => rect
  const cellRef = createRef<HTMLElement>()
  ;(cellRef as { current: HTMLElement | null }).current = cell
  return { cell, cellRef }
}

function renderBackdrop(props: Partial<Parameters<typeof ProjectBackdrop>[0]> = {}) {
  const { cell, cellRef } = cellAt(box(650, 99, 718, 702))
  const view = render(<ProjectBackdrop projectId="flinki" theme="dark" reduceMotion={false} cellRef={cellRef} {...props} />)
  return { ...view, cell, cellRef }
}

describe('ProjectBackdrop', () => {
  let stage: BackdropStage

  beforeEach(() => {
    stage = fakeStage()
    createStage.mockReturnValue(stage)
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(box(0, 0, 1440, 900))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    createStage.mockReset()
    Reflect.deleteProperty(document, 'fonts')
  })

  it('draws on two decorative canvases hidden from assistive tech', () => {
    renderBackdrop()
    const root = screen.getByTestId('project-backdrop')
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(root.querySelectorAll('canvas')).toHaveLength(2)
  })

  it('keeps the cross-fade layering inside itself, under the devices and text', () => {
    renderBackdrop()
    expect(screen.getByTestId('project-backdrop')).toHaveClass('isolate')
  })

  it('sets the theme, motion and layout before showing the scene', () => {
    renderBackdrop({ theme: 'light' })
    expect(stage.setTheme).toHaveBeenCalledWith('light')
    expect(stage.setMotion).toHaveBeenCalledWith(true)
    const layout = vi.mocked(stage.setLayout).mock.calls[0][0]
    expect(layout?.anchorX).toBe(650 + 718 / 2)
    // jsdom has no matchMedia, so the layout counts as stacked and fades below the devices.
    expect(layout?.fade).not.toBeNull()
    expect(stage.show).toHaveBeenCalledWith(PROJECT_BACKDROPS.flinki)
    const order = (fn: unknown) => vi.mocked(fn as () => void).mock.invocationCallOrder[0]
    expect(order(stage.setTheme)).toBeLessThan(order(stage.show))
    expect(order(stage.setLayout)).toBeLessThan(order(stage.show))
  })

  it('cross-fades to the next project and follows theme and motion changes', () => {
    const { rerender, cellRef } = renderBackdrop()
    rerender(<ProjectBackdrop projectId="mythica" theme="light" reduceMotion cellRef={cellRef} />)
    expect(stage.show).toHaveBeenLastCalledWith(PROJECT_BACKDROPS.mythica)
    expect(stage.setTheme).toHaveBeenLastCalledWith('light')
    expect(stage.setMotion).toHaveBeenLastCalledWith(false)
  })

  it('shows no scene for a project without one', () => {
    renderBackdrop({ projectId: 'unknown' })
    expect(stage.show).toHaveBeenCalledWith(null)
  })

  it('animates while the showcase is on screen', async () => {
    intersection.isIntersecting = true
    renderBackdrop()
    await vi.waitFor(() => expect(stage.setOnScreen).toHaveBeenCalledWith(true))
  })

  it('holds still while the showcase is off screen', async () => {
    renderBackdrop()
    await vi.waitFor(() => expect(stage.setOnScreen).toHaveBeenCalledWith(false))
    expect(stage.setOnScreen).not.toHaveBeenCalledWith(true)
  })

  it('re-measures when the stage or the device cell resizes', () => {
    const callbacks: ResizeObserverCallback[] = []
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          callbacks.push(callback)
        }
        observe() {}
        disconnect() {}
      },
    )
    const { cell } = renderBackdrop()
    cell.getBoundingClientRect = () => box(600, 99, 600, 702)
    callbacks.forEach((callback) => callback([], {} as ResizeObserver))
    const layout = vi.mocked(stage.setLayout).mock.lastCall?.[0]
    expect(layout?.anchorX).toBe(600 + 600 / 2)
  })

  it('redraws once the label font has loaded', async () => {
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } })
    renderBackdrop()
    await vi.waitFor(() => expect(stage.refresh).toHaveBeenCalled())
  })

  it('keeps exactly one live stage through a StrictMode remount', () => {
    const first = fakeStage()
    const second = fakeStage()
    createStage.mockReturnValueOnce(first).mockReturnValueOnce(second)
    const { cellRef } = cellAt(box(650, 99, 718, 702))
    render(
      <StrictMode>
        <ProjectBackdrop projectId="flinki" theme="dark" reduceMotion={false} cellRef={cellRef} />
      </StrictMode>,
    )
    expect(first.dispose).toHaveBeenCalled()
    expect(second.dispose).not.toHaveBeenCalled()
    expect(second.show).toHaveBeenCalledWith(PROJECT_BACKDROPS.flinki)
  })

  it('lets go of the canvases when it unmounts', () => {
    const { unmount } = renderBackdrop()
    unmount()
    expect(stage.dispose).toHaveBeenCalled()
  })

  it('renders quietly when the canvases cannot be painted', () => {
    createStage.mockReturnValue(null)
    expect(() => renderBackdrop()).not.toThrow()
  })
})

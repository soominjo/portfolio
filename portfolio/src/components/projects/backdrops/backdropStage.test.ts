import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { BackdropPainter } from './backdropPainter'
import { createBackdropStage, FADE_MS } from './backdropStage'
import { PROJECT_BACKDROPS } from './projectBackdrops'

const FLINKI = PROJECT_BACKDROPS.flinki
const MYTHICA = PROJECT_BACKDROPS.mythica
const REVIVA = PROJECT_BACKDROPS.reviva

function fakePainter(): BackdropPainter {
  return {
    show: vi.fn(),
    setLayout: vi.fn(),
    setTheme: vi.fn(),
    setMotion: vi.fn(),
    setRunning: vi.fn(),
    refresh: vi.fn(),
    release: vi.fn(),
    dispose: vi.fn(),
  }
}

function setup() {
  const canvases = [document.createElement('canvas'), document.createElement('canvas')] as const
  const painters = [fakePainter(), fakePainter()]
  const factory = vi.fn((canvas: HTMLCanvasElement) => painters[canvases.indexOf(canvas as never)])
  const stage = createBackdropStage(canvases, factory)!
  const look = () => canvases.map((canvas) => `${canvas.style.zIndex}:${canvas.style.opacity}`)
  return { stage, painters, look }
}

describe('createBackdropStage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('is null, and tidies up, when a canvas cannot be painted', () => {
    const working = fakePainter()
    const canvases = [document.createElement('canvas'), document.createElement('canvas')] as const
    const stage = createBackdropStage(canvases, (canvas) => (canvas === canvases[0] ? working : null))
    expect(stage).toBeNull()
    expect(working.dispose).toHaveBeenCalled()
  })

  it('fades the first scene in on the first canvas', () => {
    const { stage, painters, look } = setup()
    stage.show(FLINKI)
    expect(painters[0].show).toHaveBeenCalledWith(FLINKI)
    expect(painters[1].show).not.toHaveBeenCalled()
    expect(look()).toEqual(['1:1', '0:'])
  })

  it('fades each new scene in on top of the old one, then lets the old canvas go', () => {
    const { stage, painters, look } = setup()
    stage.setOnScreen(true)
    stage.show(FLINKI)
    stage.show(MYTHICA)
    expect(painters[1].show).toHaveBeenCalledWith(MYTHICA)
    expect(painters[1].setRunning).toHaveBeenLastCalledWith(true)
    expect(painters[0].setRunning).toHaveBeenLastCalledWith(false)
    // The old scene stays fully drawn underneath until the fade is over.
    expect(look()).toEqual(['0:1', '1:1'])
    expect(painters[0].release).not.toHaveBeenCalled()
    vi.advanceTimersByTime(FADE_MS + 100)
    expect(look()).toEqual(['0:0', '1:1'])
    expect(painters[0].release).toHaveBeenCalled()
  })

  it('goes back to an earlier scene on the spare canvas', () => {
    const { stage, painters, look } = setup()
    stage.show(FLINKI)
    stage.show(MYTHICA)
    vi.advanceTimersByTime(FADE_MS + 100)
    stage.show(FLINKI)
    expect(painters[0].show).toHaveBeenLastCalledWith(FLINKI)
    expect(look()).toEqual(['1:1', '0:1'])
    stage.show(REVIVA)
    expect(painters[1].show).toHaveBeenLastCalledWith(REVIVA)
  })

  it('catches the spare painter up on layout, theme and motion before showing it', () => {
    const { stage, painters } = setup()
    stage.show(FLINKI)
    stage.setTheme('light')
    stage.setMotion(false)
    stage.setLayout(null)
    expect(painters[0].setTheme).toHaveBeenLastCalledWith('light')
    expect(painters[1].setTheme).not.toHaveBeenCalled()
    stage.show(MYTHICA)
    expect(painters[1].setTheme).toHaveBeenCalledWith('light')
    expect(painters[1].setMotion).toHaveBeenCalledWith(false)
    expect(painters[1].setLayout).toHaveBeenCalledWith(null)
    const order = (fn: unknown) => vi.mocked(fn as () => void).mock.invocationCallOrder[0]
    expect(order(painters[1].setTheme)).toBeLessThan(order(painters[1].show))
  })

  it('ignores the scene already on show', () => {
    const { stage, painters } = setup()
    stage.show(FLINKI)
    stage.show(FLINKI)
    expect(painters[0].show).toHaveBeenCalledTimes(1)
  })

  it('fades to the plain rings for a project without a scene', () => {
    const { stage, painters } = setup()
    stage.show(FLINKI)
    stage.show(null)
    expect(painters[1].show).toHaveBeenCalledWith(null)
  })

  it('animates only the front canvas, and only while on screen', () => {
    const { stage, painters } = setup()
    stage.show(FLINKI)
    expect(painters[0].setRunning).toHaveBeenLastCalledWith(false)
    stage.setOnScreen(true)
    expect(painters[0].setRunning).toHaveBeenLastCalledWith(true)
    expect(painters[1].setRunning).not.toHaveBeenCalled()
    stage.setOnScreen(false)
    expect(painters[0].setRunning).toHaveBeenLastCalledWith(false)
  })

  it('refreshes both painters, and disposes both without releasing later', () => {
    const { stage, painters } = setup()
    stage.show(FLINKI)
    stage.show(MYTHICA)
    stage.refresh()
    stage.dispose()
    vi.advanceTimersByTime(FADE_MS * 2)
    for (const painter of painters) {
      expect(painter.refresh).toHaveBeenCalled()
      expect(painter.dispose).toHaveBeenCalled()
      expect(painter.release).not.toHaveBeenCalled()
    }
  })
})

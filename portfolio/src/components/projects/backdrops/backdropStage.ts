import type { Theme } from '../../../hooks/useTheme'
import type { BackdropLayout } from './backdropLayout'
import { createBackdropPainter, type BackdropPainter } from './backdropPainter'
import type { ProjectBackdrop } from './backdropTypes'

/** How long a new scene takes to fade in; matches `duration-700` on the canvases (ProjectBackdrop.tsx). */
export const FADE_MS = 700
// After the fade, the canvas underneath hands its memory back.
const SETTLE_MS = FADE_MS + 100

export interface BackdropStage {
  /** Fades the given project's scene in over the last one; null fades to the plain rings. */
  readonly show: (backdrop: ProjectBackdrop | null) => void
  readonly setLayout: (layout: BackdropLayout | null) => void
  readonly setTheme: (theme: Theme) => void
  readonly setMotion: (motion: boolean) => void
  /** Animates only while the showcase is on screen. */
  readonly setOnScreen: (onScreen: boolean) => void
  readonly refresh: () => void
  readonly dispose: () => void
}

type PainterFactory = (canvas: HTMLCanvasElement) => BackdropPainter | null

interface Settings {
  readonly layout: BackdropLayout | null
  readonly theme: Theme
  readonly motion: boolean
}

/** Puts `incoming` on top and fades it in from transparent, over whatever is showing. */
function fadeIn(incoming: HTMLCanvasElement, outgoing: HTMLCanvasElement): void {
  incoming.style.zIndex = '1'
  outgoing.style.zIndex = '0'
  incoming.style.transition = 'none'
  incoming.style.opacity = '0'
  // Reading layout applies the reset, so the fade below starts from 0.
  incoming.getBoundingClientRect()
  incoming.style.transition = ''
  incoming.style.opacity = '1'
}

/**
 * Two painters on two stacked canvases. A new scene is drawn on the spare
 * canvas, which fades in on top of the old one (a CSS opacity transition),
 * so the section never dips to the plain rings mid-fade. The old canvas then
 * goes dark and frees its memory until it is needed again. Null when either
 * canvas has no 2D context.
 */
export function createBackdropStage(
  canvases: readonly [HTMLCanvasElement, HTMLCanvasElement],
  makePainter: PainterFactory = (canvas) => createBackdropPainter(canvas),
): BackdropStage | null {
  const made = canvases.map((canvas) => makePainter(canvas))
  const [first, second] = made
  if (!first || !second) {
    made.forEach((painter) => painter?.dispose())
    return null
  }
  const painters = [first, second] as const
  let front = 0
  let shown: ProjectBackdrop | null | undefined
  let onScreen = false
  let settings: Settings = { layout: null, theme: 'dark', motion: true }
  let settleTimer: ReturnType<typeof setTimeout> | undefined

  // The spare painter misses updates while it sleeps; catch it up before it is shown.
  const catchUp = (painter: BackdropPainter) => {
    painter.setLayout(settings.layout)
    painter.setTheme(settings.theme)
    painter.setMotion(settings.motion)
  }

  const settle = () => {
    clearTimeout(settleTimer)
    settleTimer = setTimeout(() => {
      const back = 1 - front
      canvases[back].style.opacity = '0'
      painters[back].release()
    }, SETTLE_MS)
  }

  return {
    show: (backdrop) => {
      if (backdrop === shown) return
      const isFirst = shown === undefined
      const next = isFirst ? front : 1 - front
      shown = backdrop
      const incoming = painters[next]
      catchUp(incoming)
      incoming.show(backdrop)
      incoming.setRunning(onScreen)
      if (!isFirst) {
        painters[front].setRunning(false)
        settle()
      }
      front = next
      fadeIn(canvases[next], canvases[1 - next])
    },
    setLayout: (layout) => {
      settings = { ...settings, layout }
      painters[front].setLayout(layout)
    },
    setTheme: (theme) => {
      settings = { ...settings, theme }
      painters[front].setTheme(theme)
    },
    setMotion: (motion) => {
      settings = { ...settings, motion }
      painters[front].setMotion(motion)
    },
    setOnScreen: (next) => {
      onScreen = next
      painters[front].setRunning(next)
    },
    refresh: () => painters.forEach((painter) => painter.refresh()),
    dispose: () => {
      clearTimeout(settleTimer)
      painters.forEach((painter) => painter.dispose())
    },
  }
}

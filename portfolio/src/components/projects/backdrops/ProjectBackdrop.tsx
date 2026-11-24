import { useEffect, useRef, type RefObject } from 'react'
import { useMediaQuery } from '../../../hooks/useMediaQuery'
import type { Theme } from '../../../hooks/useTheme'
import { computeLayout } from './backdropLayout'
import { createBackdropStage, type BackdropStage } from './backdropStage'
import { backdropFor } from './projectBackdrops'

/** Tailwind's `lg`: from here the devices sit beside the text instead of above it. */
const SIDE_BY_SIDE_QUERY = '(min-width: 1024px)'

interface ProjectBackdropProps {
  /** The project on show; its scene fades in behind the devices. */
  readonly projectId: string | undefined
  readonly theme: Theme
  readonly reduceMotion: boolean
  /** The box the 3D devices are framed in. The scene centres on it and scales with it. */
  readonly cellRef: RefObject<HTMLElement | null>
}

// duration-700 matches FADE_MS in backdropStage.ts.
const CANVAS_CLASS = 'absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700 ease-out motion-reduce:transition-none'

/**
 * Each project's animated backdrop scene, drawn on two stacked canvases that
 * cross-fade between projects. It sits over the plain CSS rings, which show
 * through wherever there is no scene: unknown projects, no 2D canvas, or
 * screens too short for the devices.
 */
export function ProjectBackdrop({ projectId, theme, reduceMotion, cellRef }: ProjectBackdropProps) {
  const sideBySide = useMediaQuery(SIDE_BY_SIDE_QUERY)
  const rootRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLCanvasElement>(null)
  const secondRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<BackdropStage | null>(null)

  useEffect(() => {
    const first = firstRef.current
    const second = secondRef.current
    if (!first || !second) return undefined
    const stage = createBackdropStage([first, second])
    stageRef.current = stage
    // Labels are drawn in JetBrains Mono, so redraw the cached parts once it has loaded.
    if (stage && 'fonts' in document) void document.fonts.ready.then(() => stage.refresh())
    return () => {
      stage?.dispose()
      stageRef.current = null
    }
  }, [])

  useEffect(() => {
    stageRef.current?.setTheme(theme)
  }, [theme])

  useEffect(() => {
    stageRef.current?.setMotion(!reduceMotion)
  }, [reduceMotion])

  useEffect(() => {
    const root = rootRef.current
    const cell = cellRef.current
    if (!root || !cell) return undefined
    const measure = () => {
      const stageBox = root.getBoundingClientRect()
      const cellBox = cell.getBoundingClientRect()
      const layout = computeLayout(
        { width: stageBox.width, height: stageBox.height },
        { left: cellBox.left - stageBox.left, top: cellBox.top - stageBox.top, width: cellBox.width, height: cellBox.height },
        !sideBySide,
      )
      stageRef.current?.setLayout(layout)
    }
    measure()
    if (typeof ResizeObserver !== 'function') return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    observer.observe(cell)
    return () => observer.disconnect()
  }, [cellRef, sideBySide])

  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver !== 'function') return undefined
    // Several records can queue up during a fast scroll; the last one is current.
    const observer = new IntersectionObserver((entries) => {
      const latest = entries[entries.length - 1]
      if (latest) stageRef.current?.setOnScreen(latest.isIntersecting)
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    stageRef.current?.show(backdropFor(projectId))
  }, [projectId])

  return (
    // `isolate` keeps the canvases' z-index (used to fade the new scene in on
    // top of the old one) from lifting them over the devices and text.
    <div ref={rootRef} aria-hidden="true" data-testid="project-backdrop" className="pointer-events-none absolute inset-0 isolate">
      <canvas ref={firstRef} className={CANVAS_CLASS} />
      <canvas ref={secondRef} className={CANVAS_CLASS} />
    </div>
  )
}

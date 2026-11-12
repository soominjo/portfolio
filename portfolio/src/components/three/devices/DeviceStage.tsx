// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createDeviceScene, type DeviceScene } from './deviceScene'
import type { DeviceSlide } from './deviceTypes'

interface DeviceStageProps {
  readonly slides: readonly DeviceSlide[]
  readonly activeIndex: number
  /** Shown instead of the canvas when WebGL is unavailable. */
  readonly fallback: ReactNode
  readonly className?: string
}

// How much of the stage must be visible before the lid opens.
const IN_VIEW_AMOUNT = 0.3

function neighbours(slides: readonly DeviceSlide[], index: number): DeviceSlide[] {
  return [slides[index + 1], slides[index - 1]].filter((slide): slide is DeviceSlide => slide !== undefined)
}

/**
 * The showcase's 3D laptop and phone. The first slide appears at once and
 * later ones cross-fade; the lid opens the first time the stage is in view;
 * the devices lean toward the cursor. Frames are drawn only while something
 * moves. Reduced motion skips every animation but still swaps the screens.
 */
export default function DeviceStage({ slides, activeIndex, fallback, className }: DeviceStageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<DeviceScene | null>(null)
  const requestFrameRef = useRef<() => void>(() => {})
  const firstSlideShownRef = useRef(false)
  const introPlayedRef = useRef(false)
  const [failed, setFailed] = useState(false)
  const reduceMotion = useReducedMotion() ?? false
  const inView = useInView(containerRef, { amount: IN_VIEW_AMOUNT })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = createDeviceScene(canvas, { onChange: () => requestFrameRef.current() })
    if (!scene) {
      setFailed(true)
      return
    }
    sceneRef.current = scene
    return () => {
      sceneRef.current = null
      scene.dispose()
    }
  }, [])

  // Declared before the effects that request frames, so the request works on their first run.
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    let frame = 0
    const draw = (now: number) => {
      frame = 0
      const moving = scene.update(now)
      scene.render()
      if (moving && inView) frame = requestAnimationFrame(draw)
    }
    requestFrameRef.current = () => {
      if (frame === 0) frame = requestAnimationFrame(draw)
    }
    requestFrameRef.current()
    return () => {
      cancelAnimationFrame(frame)
      requestFrameRef.current = () => {}
    }
  }, [inView])

  useEffect(() => {
    const scene = sceneRef.current
    const container = containerRef.current
    if (!scene || !container) return
    const fit = () => {
      scene.resize(container.clientWidth, container.clientHeight)
      requestFrameRef.current()
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    const scene = sceneRef.current
    const slide = slides[activeIndex]
    if (!scene || !slide) return
    scene.setSlide(slide, { immediate: reduceMotion || !firstSlideShownRef.current })
    firstSlideShownRef.current = true
    scene.prefetch(neighbours(slides, activeIndex))
  }, [slides, activeIndex, reduceMotion])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !inView || introPlayedRef.current) return
    introPlayedRef.current = true
    scene.playIntro({ immediate: reduceMotion })
  }, [inView, reduceMotion])

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene || !inView || reduceMotion) return
    const onPointerMove = (event: PointerEvent) => {
      scene.setPointer(event.clientX / window.innerWidth - 0.5, event.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [inView, reduceMotion])

  if (failed) return <>{fallback}</>

  return (
    <div ref={containerRef} aria-hidden="true" className={className}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}

// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { createChatOrbScene, getOrbLean, type ChatOrbScene } from './chatOrbScene'

export interface ChatOrbProps {
  theme: Theme
  /** True while the chat is open and the orb is tucked away. */
  paused: boolean
  /** Called once, after the first frame is drawn. */
  onReady: () => void
}

// The hero sphere's rotation spring, so both lean with the same weight.
const LEAN_SPRING = { stiffness: 30, damping: 20, mass: 2 } as const
const DEFAULT_SIZE_PX = 72

function fitToCanvas(orb: ChatOrbScene, canvas: HTMLCanvasElement): void {
  orb.resize(canvas.clientWidth || DEFAULT_SIZE_PX, window.devicePixelRatio || 1)
}

/**
 * The chat button's living orb: the hero sphere's noise shader, shrunk to a
 * button. It leans toward a nearby pointer, pauses while the chat is open or
 * the tab is hidden, draws one still frame under reduced motion, and renders
 * nothing when WebGL is unavailable, so the launcher's CSS orb stays.
 */
export default function ChatOrb({ theme, paused, onReady }: ChatOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<ChatOrbScene | null>(null)
  const startRef = useRef(0)
  const readyRef = useRef(false)
  const onReadyRef = useRef(onReady)
  const [failed, setFailed] = useState(false)
  const [hidden, setHidden] = useState(() => document.hidden)
  const reduceMotion = useReducedMotion()
  const leanX = useSpring(0, LEAN_SPRING)
  const leanY = useSpring(0, LEAN_SPRING)
  const animate = !paused && !reduceMotion && !hidden

  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const orb = createChatOrbScene(canvas)
    if (!orb) {
      setFailed(true)
      return
    }

    // Size the drawing buffer before anything draws, so no frame is stretched.
    fitToCanvas(orb, canvas)
    sceneRef.current = orb
    startRef.current = performance.now()

    return () => {
      sceneRef.current = null
      orb.dispose()
    }
  }, [])

  // Declared before the loop so the lights exist at the first frame; adding a
  // light later would force three to compile the noise shader again.
  useEffect(() => {
    const orb = sceneRef.current
    if (!orb) return

    orb.setTheme(theme)
    orb.render()
    if (!readyRef.current) {
      readyRef.current = true
      onReadyRef.current()
    }
  }, [theme])

  useEffect(() => {
    const orb = sceneRef.current
    const canvas = canvasRef.current
    if (!orb || !canvas) return

    const refit = () => {
      fitToCanvas(orb, canvas)
      orb.render()
    }
    window.addEventListener('resize', refit)
    return () => window.removeEventListener('resize', refit)
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    const orb = sceneRef.current
    if (!orb) return

    if (!animate) {
      orb.render()
      return
    }

    let frame = 0
    const loop = (now: number) => {
      orb.tick(now - startRef.current, { x: leanX.get(), y: leanY.get() })
      orb.render()
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [animate, leanX, leanY])

  useEffect(() => {
    if (!animate) return

    const onPointerMove = (event: PointerEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const lean = getOrbLean(
        { x: event.clientX, y: event.clientY },
        { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      )
      leanX.set(lean.x)
      leanY.set(lean.y)
    }

    window.addEventListener('pointermove', onPointerMove)
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [animate, leanX, leanY])

  if (failed) return null

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
}

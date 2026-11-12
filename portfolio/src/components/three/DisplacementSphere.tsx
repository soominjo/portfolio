// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { motion, useInView, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { createSphereScene, type SphereScene } from './sphereScene'

interface DisplacementSphereProps {
  theme: Theme
  className?: string
}

const ROTATION_SPRING = { stiffness: 30, damping: 20, mass: 2 } as const
const CANVAS_HEIGHT_RATIO = 1.3
const CANVAS_OPACITY = 0.85
const FADE_IN = { duration: 3, ease: [0.22, 1, 0.36, 1] } as const
// The coloured sphere is vivid against the light page, so it steps back there.
// This is applied without a transition so it lands in the same frame as the
// theme switch's view-transition snapshot.
const THEME_OPACITY: Record<Theme, number> = { dark: 1, light: 0.35 }

/**
 * Noise-displaced sphere that drifts behind the hero and leans toward the
 * cursor. It pauses while off-screen, draws one still frame under reduced
 * motion, dims on the light theme, and renders nothing when WebGL is
 * unavailable.
 */
export default function DisplacementSphere({ theme, className }: DisplacementSphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<SphereScene | null>(null)
  const startRef = useRef(0)
  const [failed, setFailed] = useState(false)
  const reduceMotion = useReducedMotion()
  const inView = useInView(canvasRef)
  const rotationX = useSpring(0, ROTATION_SPRING)
  const rotationY = useSpring(0, ROTATION_SPRING)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const sphere = createSphereScene(canvas)
    if (!sphere) {
      setFailed(true)
      return
    }

    sceneRef.current = sphere
    startRef.current = performance.now()

    return () => {
      sceneRef.current = null
      sphere.dispose()
    }
  }, [])

  // Declared before the resize effect so the lights exist at the first frame;
  // adding a light later would force three to compile the noise shader again.
  useEffect(() => {
    const sphere = sceneRef.current
    if (!sphere) return

    sphere.setTheme(theme)
    sphere.render()
  }, [theme])

  useEffect(() => {
    const sphere = sceneRef.current
    if (!sphere) return

    const fitToWindow = () => {
      sphere.resize(window.innerWidth, window.innerHeight * CANVAS_HEIGHT_RATIO)
      sphere.render()
    }

    fitToWindow()
    window.addEventListener('resize', fitToWindow)
    return () => window.removeEventListener('resize', fitToWindow)
  }, [])

  useEffect(() => {
    if (reduceMotion || !inView) return

    const onMouseMove = (event: MouseEvent) => {
      rotationX.set(event.clientY / window.innerHeight / 2)
      rotationY.set(event.clientX / window.innerWidth / 2)
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [inView, reduceMotion, rotationX, rotationY])

  useEffect(() => {
    const sphere = sceneRef.current
    if (!sphere) return

    if (reduceMotion || !inView) {
      sphere.render()
      return
    }

    let frame = 0
    const loop = (now: number) => {
      sphere.tick(now - startRef.current, rotationX.get(), rotationY.get())
      sphere.render()
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduceMotion, rotationX, rotationY])

  if (failed) return null

  return (
    <div
      aria-hidden="true"
      data-testid="sphere-layer"
      className={className}
      style={{ opacity: THEME_OPACITY[theme] }}
    >
      <motion.canvas
        ref={canvasRef}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: CANVAS_OPACITY }}
        transition={FADE_IN}
      />
    </div>
  )
}

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import rocketLitPng2x from '../../assets/cursors/rocket-lit@2x.png'
import rocketLitPng from '../../assets/cursors/rocket-lit.png'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { Theme } from '../../hooks/useTheme'
import { EXHAUST_QUERY, ROCKET_CURSOR_CLASS, ROCKET_CURSOR_QUERY } from './cursorRules'
import { startExhaust } from './exhaustEngine'

interface RocketCursorProps {
  theme: Theme
}

/**
 * The site cursor: a small rocket whose nose is the click point, with its
 * engine lit over links and buttons. The rocket is a real cursor image set in
 * index.css, so it never lags and still shows over the project dialog in the
 * top layer. This component switches those rules on and, on mouse screens
 * without reduced motion, adds a click-through canvas for the exhaust trail.
 */
export function RocketCursor({ theme }: RocketCursorProps) {
  const showRocket = useMediaQuery(ROCKET_CURSOR_QUERY)
  const showExhaust = useMediaQuery(EXHAUST_QUERY)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeRef = useRef(theme)

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.add(ROCKET_CURSOR_CLASS)
    return () => root.classList.remove(ROCKET_CURSOR_CLASS)
  }, [])

  // The plain rocket loads as soon as the cursor rules apply. Fetching the lit
  // one now means the first hover over a link doesn't flash the system hand.
  useEffect(() => {
    if (!showRocket) return
    const image = new Image()
    image.srcset = `${rocketLitPng} 1x, ${rocketLitPng2x} 2x`
  }, [showRocket])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!showExhaust || !canvas) return undefined
    const engine = startExhaust(canvas, { getTheme: () => themeRef.current })
    return () => engine?.dispose()
  }, [showExhaust])

  if (!showExhaust) return null

  return createPortal(
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="rocket-exhaust"
      className="pointer-events-none fixed inset-0 z-100 h-full w-full"
    />,
    document.body,
  )
}

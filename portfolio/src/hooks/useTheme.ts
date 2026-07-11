import { useState, useEffect } from 'react'
import { flushSync } from 'react-dom'

type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    return stored === 'light' || stored === 'dark' ? stored : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'

    // Keyboard-activated clicks (Enter/Space) report clientX/Y as 0 — fall back
    // to the button's own position so the wipe originates from the toggle.
    const keyboardActivated = e.clientX === 0 && e.clientY === 0
    const origin = keyboardActivated ? e.currentTarget.getBoundingClientRect() : null
    const x = origin ? origin.left + origin.width / 2 : e.clientX
    const y = origin ? origin.top + origin.height / 2 : e.clientY

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!document.startViewTransition || reduceMotion) {
      setTheme(next)
      return
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next))
    })

    transition.ready
      .then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        )
      })
      .catch(() => {
        // Transition was skipped (e.g. tab hidden, or superseded by another
        // transition) — the state update already applied, nothing else to do.
      })
  }

  return { theme, toggleTheme }
}

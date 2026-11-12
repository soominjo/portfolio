// Menu pattern adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState, type MouseEvent } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { FOCUS_RING, ICON_BUTTON_CLASS, LOGO_LABEL, NAV_EASE, NAV_LINKS } from './navConfig'
import { CloseIcon, MenuIcon } from './NavIcons'
import { SocialLinks } from './SocialLinks'
import { ThemeToggle } from './ThemeToggle'

interface MobileNavProps {
  theme: Theme
  onToggleTheme: (event: MouseEvent<HTMLButtonElement>) => void
  current: string | null
}

/** Everything on the page beside the header this nav lives in. */
function pageOutside(element: Element | null): Element[] {
  const header = element?.closest('header')
  const parent = header?.parentElement
  return parent ? Array.from(parent.children).filter((child) => child !== header) : []
}

/**
 * Phones and short screens: a slim top bar and a menu that slides down over
 * the page. While it is open, the page behind can't be focused, read or
 * scrolled, and Escape closes it and returns focus to the menu button.
 */
export function MobileNav({ theme, onToggleTheme, current }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const rootRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const background = pageOutside(rootRef.current)
    for (const element of background) element.setAttribute('inert', '')
    const root = document.documentElement
    const previousOverflow = root.style.overflow
    root.style.overflow = 'hidden'

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      for (const element of background) element.removeAttribute('inert')
      root.style.overflow = previousOverflow
    }
  }, [open])

  const slide = reduceMotion ? { opacity: 0 } : { y: '-100%' }

  return (
    <div ref={rootRef} className="desk:hidden">
      <div className="fixed inset-x-0 top-0 z-60 flex h-16 items-center justify-between border-b border-indigo-500/20 bg-[#05070f]/85 px-4 backdrop-blur-xl light:bg-white/85">
        <a
          href="#hero"
          aria-label={LOGO_LABEL}
          className={`font-display text-xl font-bold tracking-tight text-white light:text-slate-900 ${FOCUS_RING}`}
        >
          GC<span className="glow-cyan text-indigo-400 light:text-indigo-600">.</span>
        </a>
        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((previous) => !previous)}
            className={ICON_BUTTON_CLASS}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Menu"
            className="fixed inset-x-0 bottom-0 top-16 z-55 flex flex-col items-center justify-center-safe overflow-y-auto bg-[#05070f]/92 py-8 backdrop-blur-xl light:bg-white/92"
            initial={slide}
            animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
            exit={slide}
            transition={{ duration: 0.4, ease: NAV_EASE }}
          >
            <ul className="flex flex-col items-center gap-1">
              {NAV_LINKS.map(({ label, href }, index) => (
                <motion.li
                  key={href}
                  initial={reduceMotion ? false : { opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05, duration: 0.3, ease: NAV_EASE }}
                >
                  <a
                    href={href}
                    aria-current={current === href ? 'location' : undefined}
                    onClick={() => setOpen(false)}
                    className={`group relative block px-10 py-4 font-display text-2xl font-bold text-slate-200 transition-colors hover:text-white aria-[current=location]:text-cyan-400 light:text-slate-700 light:hover:text-slate-900 light:aria-[current=location]:text-cyan-700 ${FOCUS_RING}`}
                  >
                    {label}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-10 bottom-3 h-0.5 origin-right scale-x-0 bg-cyan-400 transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100 light:bg-cyan-600"
                    />
                  </a>
                </motion.li>
              ))}
            </ul>
            <SocialLinks className="mt-10 flex items-center gap-2" />
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}

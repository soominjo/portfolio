import { useEffect, useRef, type MouseEvent } from 'react'
import { isPlainLeftClick } from '../../hooks/useRoute'
import type { Theme } from '../../hooks/useTheme'
import { FOCUS_RING } from '../layout/navConfig'
import { ThemeToggle } from '../layout/ThemeToggle'
import { TerminalForm } from './TerminalForm'

interface ContactPageProps {
  readonly theme: Theme
  readonly onToggleTheme: (event: MouseEvent<HTMLButtonElement>) => void
  /** Leaves for the homepage's Contact block. */
  readonly onBack: () => void
}

const PAGE_TITLE = 'Contact — Genessis Contreras'

const LOGO_CLASS = `font-display text-2xl font-bold leading-none tracking-tight text-white transition-colors hover:text-indigo-400 light:text-slate-900 light:hover:text-indigo-600 ${FOCUS_RING}`
const BACK_CLASS = `rounded-lg border border-white/10 px-3 py-2 font-mono-label text-xs tracking-[0.06em] text-slate-400 transition-colors hover:border-cyan-400 hover:text-cyan-400 light:border-slate-900/10 light:text-slate-600 light:hover:border-cyan-700 light:hover:text-cyan-700 ${FOCUS_RING}`

/**
 * The /contact page: nothing from the homepage, just the logo, a way back,
 * the theme switch and the terminal form.
 */
export function ContactPage({ theme, onToggleTheme, onBack }: ContactPageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Arriving reads as a new page: top of the window, the heading announced, a tab title of its own.
  useEffect(() => {
    const previousTitle = document.title
    document.title = PAGE_TITLE
    window.scrollTo({ top: 0, behavior: 'instant' })
    headingRef.current?.focus({ preventScroll: true })
    return () => {
      document.title = previousTitle
    }
  }, [])

  const goBack = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (!isPlainLeftClick(event)) return
    event.preventDefault()
    onBack()
  }

  return (
    <div className="grid-bg relative flex min-h-svh flex-col bg-[#05070f] light:bg-[#f7f9fc]">
      <div className="flex items-center gap-5 px-4 py-4 sm:px-8 sm:py-7">
        <a href="/" onClick={goBack} aria-label="GC, Genessis Contreras, back to portfolio" className={LOGO_CLASS}>
          GC<span className="glow-cyan text-indigo-400 light:text-indigo-600">.</span>
        </a>
        <a href="/#contact" onClick={goBack} className={BACK_CLASS}>
          ← Back to portfolio
        </a>
        <div className="ml-auto">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      <main className="mx-auto w-full max-w-[590px] flex-1 content-center px-4 pb-16 sm:px-8">
        <p className="mb-3 font-mono-label text-xs uppercase tracking-[0.25em] text-indigo-400 light:text-indigo-600">
          {'// get.in.touch'}
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mb-6 font-display text-3xl font-bold text-white outline-none sm:text-[2.125rem] light:text-slate-900"
        >
          Send me a message
        </h1>
        <TerminalForm onBack={onBack} />
      </main>
    </div>
  )
}

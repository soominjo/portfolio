import { useLayoutEffect, useRef, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import { goBackOr, savedScrollY, useRoute } from './hooks/useRoute'
import { ContactPage } from './components/contact/ContactPage'
import { CONTACT_OPEN_FORM_ID } from './components/contact/contactIds'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Projects } from './components/sections/Projects'
import { Contact } from './components/sections/Contact'
import { Chatbot } from './components/Chatbot'
import { RocketCursor } from './components/cursor/RocketCursor'
import { Resume } from './components/Resume'

const CONTACT_PATH = '/contact'

/**
 * Back on the homepage after /contact: scroll to where the visitor left off
 * (or the Contact block after a direct visit) and focus the link they used.
 */
function returnToContactBlock(): void {
  history.scrollRestoration = 'auto'
  const scrollY = savedScrollY()
  if (scrollY !== null) {
    window.scrollTo({ top: scrollY, behavior: 'instant' })
  } else {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }
  document.getElementById(CONTACT_OPEN_FORM_ID)?.focus({ preventScroll: true })
}

/**
 * A modal dialog keeps everything outside it inert, even once its own section
 * is hidden. One left open on the homepage (say, a project's details, then
 * Back or Forward to /contact) would freeze the form page.
 */
function closeOpenDialogs(root: HTMLElement | null): void {
  root?.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((dialog) => dialog.close())
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const path = useRoute()
  const onContact = path === CONTACT_PATH

  // A direct visit to /contact doesn't load the homepage until the visitor goes there.
  // After that it stays mounted (hidden while /contact shows), so Back is instant.
  const [homeMounted, setHomeMounted] = useState(!onContact)
  if (!onContact && !homeMounted) setHomeMounted(true)

  const homeRef = useRef<HTMLDivElement>(null)
  const previousPath = useRef(path)
  useLayoutEffect(() => {
    const previous = previousPath.current
    previousPath.current = path
    if (path === previous) return
    if (path === CONTACT_PATH) {
      history.scrollRestoration = 'manual'
      closeOpenDialogs(homeRef.current)
    } else if (previous === CONTACT_PATH) {
      returnToContactBlock()
    }
  }, [path])

  if (path === '/resume') {
    return <Resume />
  }

  return (
    <div className="relative">
      {homeMounted && (
        // hidden is display: none, so the 3D scenes' observers see them off screen and pause.
        <div ref={homeRef} hidden={onContact} inert={onContact}>
          <Navbar theme={theme} onToggleTheme={toggleTheme} />

          <main>
            <Hero theme={theme} />
            <Projects theme={theme} />
            <About />
            <Contact />
          </main>

          <Footer />
          <Chatbot pageHidden={onContact} />
        </div>
      )}
      {onContact && (
        <ContactPage theme={theme} onToggleTheme={toggleTheme} onBack={() => goBackOr('/#contact')} />
      )}
      <RocketCursor theme={theme} />
    </div>
  )
}

export default App

import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ContactPage } from './ContactPage'

function renderPage() {
  const onBack = vi.fn()
  const onToggleTheme = vi.fn()
  const view = render(<ContactPage theme="dark" onToggleTheme={onToggleTheme} onBack={onBack} />)
  return { ...view, onBack, onToggleTheme }
}

// Fires a click and reports whether the page handled it. A window listener runs
// after React's, records defaultPrevented, then prevents jsdom's navigation.
function clickAndCheck(element: Element, init: MouseEventInit = {}): boolean {
  let prevented = false
  window.addEventListener(
    'click',
    (event) => {
      prevented = event.defaultPrevented
      event.preventDefault()
    },
    { once: true },
  )
  fireEvent.click(element, init)
  return prevented
}

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn())
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('ContactPage', () => {
  it('shows only the form page chrome', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Send me a message' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^← back to portfolio$/i })).toHaveAttribute('href', '/#contact')
    expect(screen.getByRole('link', { name: /^GC, Genessis Contreras, back to portfolio$/ })).toHaveAttribute('href', '/')
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Sections' })).toBeNull()
  })

  it('focuses the heading and names the tab', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    expect(document.title).toBe('Contact — Genessis Contreras')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })

  it('restores the previous title when it leaves', () => {
    document.title = 'Home'
    const { unmount } = renderPage()
    unmount()
    expect(document.title).toBe('Home')
  })

  it('goes back from the logo and the back link', () => {
    const { onBack } = renderPage()
    const logo = screen.getByRole('link', { name: /^GC, Genessis Contreras/ })
    const back = screen.getByRole('link', { name: /^← back to portfolio$/i })

    expect(clickAndCheck(logo)).toBe(true)
    expect(clickAndCheck(back)).toBe(true)
    expect(onBack).toHaveBeenCalledTimes(2)

    expect(clickAndCheck(back, { ctrlKey: true })).toBe(false)
    expect(onBack).toHaveBeenCalledTimes(2)
  })

  it('switches the theme', () => {
    const { onToggleTheme } = renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }))
    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })
})

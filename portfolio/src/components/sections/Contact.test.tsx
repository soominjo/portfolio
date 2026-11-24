import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Contact } from './Contact'

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

afterEach(() => {
  history.replaceState(null, '', '/')
})

describe('Contact', () => {
  it('greets with "Hi there" and the bio', () => {
    render(<Contact />)
    expect(screen.getByRole('heading', { level: 2, name: 'Hi there' })).toBeInTheDocument()
    expect(screen.getByText(/I'm Genessis, a full-stack developer based in Cavite, Philippines\./)).toBeInTheDocument()
    expect(screen.getByText(/feel free to drop me a line\./)).toBeInTheDocument()
  })

  it.each([
    ['Hytel', 'https://www.hytel.io/'],
    ['Flinki', 'https://flinki.co/'],
  ])('links %s in the bio to its site in a new tab', (name, href) => {
    render(<Contact />)
    // jsdom drops the space before the screen-reader-only note; browsers keep it.
    const link = screen.getByRole('link', { name: new RegExp(`^${name} ?\\(opens in a new tab\\)$`) })
    expect(link).toHaveAttribute('href', href)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('opens the form page in-app on a plain click', () => {
    render(<Contact />)
    const link = screen.getByRole('link', { name: 'Send me a message' })
    expect(link).toHaveAttribute('href', '/contact')
    expect(link).toHaveAttribute('id', 'contact-open-form')

    expect(clickAndCheck(link)).toBe(true)
    expect(window.location.pathname).toBe('/contact')
  })

  it.each([[{ ctrlKey: true }], [{ metaKey: true }], [{ shiftKey: true }], [{ button: 1 }]])(
    'leaves %o clicks to the browser',
    (init) => {
      render(<Contact />)
      expect(clickAndCheck(screen.getByRole('link', { name: 'Send me a message' }), init)).toBe(false)
      expect(window.location.pathname).toBe('/')
    },
  )

  it('shows the photo in the holo frame', () => {
    render(<Contact />)
    const photo = screen.getByRole('img', { name: 'Genessis Contreras' })
    expect(photo).toHaveAttribute('loading', 'lazy')
    expect(photo.getAttribute('srcset')).toContain('1100w')
    expect(photo).toHaveAttribute('width', '640')
    expect(photo).toHaveAttribute('height', '854')
    for (const text of ['~ genessis/profile.webp', 'AVAILABLE', 'GENESSIS S. CONTRERAS', 'CAVITE · PH']) {
      expect(screen.getByText(text)).toBeInTheDocument()
    }
  })

  it('keeps the form off the homepage', () => {
    render(<Contact />)
    expect(screen.queryByRole('textbox')).toBeNull()
  })
})

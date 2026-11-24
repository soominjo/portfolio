import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { installDialogPolyfill } from './components/projects/testProjects'

const { orbProps } = vi.hoisted(() => ({ orbProps: [] as Array<{ paused: boolean }> }))

// The hero, the project devices and the chat orb need WebGL and have their own
// tests. Here only the order of the page's sections matters, plus whether the
// chat orb is told to pause while the form page hides the homepage.
vi.mock('./components/sections/Hero', () => ({ Hero: () => <section id="hero" /> }))
vi.mock('./components/three/devices/DeviceStage', () => ({ default: () => null }))
vi.mock('./components/three/ChatOrb', () => ({
  default: ({ paused }: { paused: boolean }) => {
    orbProps.push({ paused })
    return null
  },
}))

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

const openForm = () => clickAndCheck(screen.getByRole('link', { name: 'Send me a message' }))

// jsdom traverses history on a later task, then fires popstate.
async function goBack(): Promise<void> {
  await act(async () => {
    history.back()
    await new Promise((resolve) => setTimeout(resolve, 20))
  })
}

// jsdom has no showModal(); the project dialog needs it.
beforeAll(installDialogPolyfill)

beforeEach(() => {
  orbProps.length = 0
  vi.stubGlobal('scrollTo', vi.fn())
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  history.replaceState(null, '', '/')
})

describe('App', () => {
  it('shows the projects straight after the hero, with About below them', () => {
    render(<App />)
    const sections = Array.from(document.querySelectorAll('main > section'), (section) => section.id)
    expect(sections).toEqual(['hero', 'projects', 'about', 'contact'])
  })

  it('lists the sections in the side nav in the order the page shows them', () => {
    render(<App />)
    const rail = screen.getByRole('navigation', { name: 'Sections' })
    const navOrder = within(rail)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href') ?? '')
      .filter((href) => href.startsWith('#'))
    // querySelectorAll returns matches in document order, whatever the selector order.
    const pageOrder = Array.from(document.querySelectorAll(navOrder.join(', ')), (target) => `#${target.id}`)
    expect(navOrder).toEqual(pageOrder)
  })

  it('flies the rocket cursor on the portfolio page', () => {
    render(<App />)
    expect(document.documentElement).toHaveClass('rocket-cursor')
  })

  it('opens /contact in-app and keeps the homepage underneath', async () => {
    render(<App />)
    expect(openForm()).toBe(true)

    expect(screen.getByRole('heading', { level: 1, name: 'Send me a message' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/contact')
    expect(document.getElementById('projects')?.closest('[hidden]')).not.toBeNull()
    expect(document.getElementById('contact')).toBeInTheDocument()
    await waitFor(() => expect(orbProps.at(-1)?.paused).toBe(true))
  })

  it('returns to the Contact block on Back', async () => {
    render(<App />)
    Object.defineProperty(window, 'scrollY', { value: 3200, configurable: true })
    openForm()

    await goBack()
    await waitFor(() => expect(screen.queryByRole('heading', { level: 1 })).toBeNull())
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 3200, behavior: 'instant' })
    expect(screen.getByRole('link', { name: 'Send me a message' })).toHaveFocus()
    expect(orbProps.at(-1)?.paused).toBe(false)
  })

  it('renders only the form page on a direct visit, then goes home to the Contact block', () => {
    history.pushState(null, '', '/contact')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Send me a message' })).toBeInTheDocument()
    expect(document.getElementById('projects')).toBeNull()

    clickAndCheck(screen.getByRole('link', { name: /^← back to portfolio$/i }))
    expect(window.location.pathname + window.location.hash).toBe('/#contact')
    expect(document.getElementById('projects')).toBeInTheDocument()
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
    expect(screen.getByRole('link', { name: 'Send me a message' })).toHaveFocus()
  })

  it('goes home in-app after a refresh on /contact', () => {
    // A refreshed page keeps the entry's state from the page load before it.
    history.replaceState({ inApp: true }, '', '/contact')
    const back = vi.spyOn(history, 'back')
    render(<App />)

    clickAndCheck(screen.getByRole('link', { name: /^← back to portfolio$/i }))
    expect(back).not.toHaveBeenCalled()
    expect(window.location.pathname + window.location.hash).toBe('/#contact')
    expect(document.getElementById('projects')).toBeInTheDocument()
    back.mockRestore()
  })

  // A modal dialog keeps the rest of the page inert even when its own section is
  // hidden, so one left open would freeze the form page.
  it('closes an open project dialog when the form page takes over', () => {
    render(<App />)
    fireEvent.click(screen.getAllByRole('button', { name: /view more/i })[0])
    const dialog = document.querySelector('#projects dialog') as HTMLDialogElement
    expect(dialog.open).toBe(true)

    clickAndCheck(document.getElementById('contact-open-form') as HTMLElement)
    expect(window.location.pathname).toBe('/contact')
    expect(dialog.open).toBe(false)
  })

  it('gives a fresh form after coming back', async () => {
    render(<App />)
    openForm()
    fireEvent.change(screen.getByLabelText('name'), { target: { value: 'Jane Smith' } })

    await goBack()
    await waitFor(() => expect(screen.queryByRole('heading', { level: 1 })).toBeNull())
    openForm()
    expect(screen.getByLabelText('name')).toHaveValue('')
  })

  it('keeps /resume as it is', () => {
    history.pushState(null, '', '/resume')
    render(<App />)
    expect(document.getElementById('projects')).toBeNull()
    expect(document.documentElement).not.toHaveClass('rocket-cursor')
  })

  it('flies the rocket cursor on the form page too', () => {
    history.pushState(null, '', '/contact')
    render(<App />)
    expect(document.documentElement).toHaveClass('rocket-cursor')
  })
})

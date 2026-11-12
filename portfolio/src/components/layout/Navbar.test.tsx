import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { profile } from '../../../../shared/data/profile'
import type { Theme } from '../../hooks/useTheme'
import { intersection } from '../../test/controls'
import { Navbar } from './Navbar'

function renderNavbar(theme: Theme = 'dark') {
  const onToggleTheme = vi.fn()
  render(<Navbar theme={theme} onToggleTheme={onToggleTheme} />)
  return { onToggleTheme }
}

// The nav plus the page it works with: the sections it tracks, and the
// main/footer the phone menu makes inert while it is open.
function renderWithPage() {
  render(
    <div>
      <Navbar theme="dark" onToggleTheme={vi.fn()} />
      <main data-testid="page">
        <section id="projects" />
        <section id="about">
          <div id="experience" />
        </section>
        <section id="contact" />
      </main>
      <footer data-testid="footer" />
    </div>,
  )
  return screen.getByRole('navigation', { name: 'Sections' })
}

const SECTIONS = [
  ['Projects', '#projects'],
  ['About', '#about'],
  ['Experience', '#experience'],
  ['Contact', '#contact'],
] as const

describe('Navbar', () => {
  it('links every section from the side rail', () => {
    renderNavbar()
    const rail = screen.getByRole('navigation', { name: 'Sections' })
    for (const [label, href] of SECTIONS) {
      expect(within(rail).getByRole('link', { name: label })).toHaveAttribute('href', href)
    }
  })

  it('opens GitHub and LinkedIn in a new tab', () => {
    renderNavbar()
    const github = screen.getByRole('link', { name: 'GitHub' })
    const linkedin = screen.getByRole('link', { name: 'LinkedIn' })
    expect(github).toHaveAttribute('href', profile.githubUrl)
    expect(linkedin).toHaveAttribute('href', profile.linkedinUrl)
    for (const link of [github, linkedin]) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('keeps the resume one click away', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/resume')
  })

  it('switches the theme', () => {
    const { onToggleTheme } = renderNavbar()
    fireEvent.click(screen.getAllByRole('button', { name: 'Switch to light mode' })[0])
    expect(onToggleTheme).toHaveBeenCalledTimes(1)
  })

  it('moves the theme switch out of the side rail into the page corner', () => {
    renderNavbar()
    expect(
      within(screen.getByTestId('side-rail')).queryByRole('button', { name: /switch to/i }),
    ).not.toBeInTheDocument()
    expect(
      within(screen.getByTestId('corner-controls')).getByRole('button', {
        name: 'Switch to light mode',
      }),
    ).toBeInTheDocument()
  })

  it('gives each theme icon its own mask', () => {
    renderNavbar()
    const icons = Array.from(document.querySelectorAll('svg')).filter((svg) => svg.querySelector('mask'))
    expect(icons.length).toBeGreaterThanOrEqual(2)

    const ids = icons.map((svg) => svg.querySelector('mask')?.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const [index, svg] of icons.entries()) {
      expect(svg.querySelector('circle[mask]')).toHaveAttribute('mask', `url(#${ids[index]})`)
    }
  })

  it('offers the dark theme when the page is light', () => {
    renderNavbar('light')
    expect(screen.getAllByRole('button', { name: 'Switch to dark mode' }).length).toBeGreaterThan(0)
  })

  it('names the logo with its visible text so voice control can find it', () => {
    renderNavbar()
    const logos = screen.getAllByRole('link', { name: /^GC, Genessis Contreras/ })
    expect(logos).toHaveLength(2)
    for (const logo of logos) expect(logo).toHaveAttribute('href', '#hero')
  })

  it('marks the section crossing the middle of the screen as current', async () => {
    intersection.byId = { projects: true }
    const rail = renderWithPage()
    await waitFor(() =>
      expect(within(rail).getByRole('link', { name: 'Projects' })).toHaveAttribute(
        'aria-current',
        'location',
      ),
    )
    expect(within(rail).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('prefers Experience over About while both cross the middle', async () => {
    intersection.byId = { about: true, experience: true }
    const rail = renderWithPage()
    await waitFor(() =>
      expect(within(rail).getByRole('link', { name: 'Experience' })).toHaveAttribute(
        'aria-current',
        'location',
      ),
    )
    expect(within(rail).getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })

  it('follows the section in view rather than the last click', async () => {
    intersection.byId = { about: true }
    const rail = renderWithPage()
    fireEvent.click(within(rail).getByRole('link', { name: 'Projects' }))
    await waitFor(() =>
      expect(within(rail).getByRole('link', { name: 'About' })).toHaveAttribute(
        'aria-current',
        'location',
      ),
    )
    expect(within(rail).getByRole('link', { name: 'Projects' })).not.toHaveAttribute('aria-current')
  })

  it('marks nothing as current while the hero is in view', async () => {
    const rail = renderWithPage()
    await act(async () => {
      await Promise.resolve()
    })
    for (const [label] of SECTIONS) {
      expect(within(rail).getByRole('link', { name: label })).not.toHaveAttribute('aria-current')
    }
  })

  it('makes the page behind the open menu inert and stops it scrolling', () => {
    renderWithPage()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByTestId('page')).toHaveAttribute('inert')
    expect(screen.getByTestId('footer')).toHaveAttribute('inert')
    expect(document.documentElement.style.overflow).toBe('hidden')

    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.getByTestId('page')).not.toHaveAttribute('inert')
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('returns focus to the menu button after Escape', () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus()
  })

  it('opens the mobile menu and closes it once a section is picked', async () => {
    renderNavbar()
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    const menu = screen.getByRole('navigation', { name: 'Menu' })
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(within(menu).getByRole('link', { name: 'Contact' }))
    await waitFor(() =>
      expect(screen.queryByRole('navigation', { name: 'Menu' })).not.toBeInTheDocument(),
    )
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the mobile menu with Escape', async () => {
    renderNavbar()
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() =>
      expect(screen.queryByRole('navigation', { name: 'Menu' })).not.toBeInTheDocument(),
    )
  })
})

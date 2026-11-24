import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

// The hero, the project devices and the chat orb need WebGL and have their own
// tests. Here only the order of the page's sections matters.
vi.mock('./components/sections/Hero', () => ({ Hero: () => <section id="hero" /> }))
vi.mock('./components/three/devices/DeviceStage', () => ({ default: () => null }))
vi.mock('./components/three/ChatOrb', () => ({ default: () => null }))

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
})

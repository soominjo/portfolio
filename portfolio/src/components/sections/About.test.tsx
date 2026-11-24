import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { About } from './About'

describe('About', () => {
  // The bio, its links and the button moved to Contact, and the heading and
  // facts card went, so the section opens on Experience.
  it('opens straight on Experience', () => {
    render(<About />)
    expect(screen.queryByText('// about.sys')).toBeNull()
    expect(screen.queryByText(/Full-Stack Engineer/)).toBeNull()
    expect(screen.queryByText('~ genessis/profile.json')).toBeNull()
    expect(screen.queryByText('genesis060102@gmail.com')).toBeNull()
    expect(screen.queryByText(/I'm Genessis/)).toBeNull()
    expect(screen.getByRole('heading', { level: 2, name: 'Experience' })).toBeInTheDocument()
  })

  // "About" left the side nav, so #experience has to cover the tech stack too
  // for "Experience" to stay highlighted while it is on screen.
  it('keeps the tech stack inside #experience', () => {
    render(<About />)
    const experience = document.getElementById('experience')
    expect(experience).not.toBeNull()
    expect(within(experience as HTMLElement).getByRole('heading', { name: 'What I Work With' })).toBeInTheDocument()
  })
})

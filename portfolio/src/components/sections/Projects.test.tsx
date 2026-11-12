import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Projects } from './Projects'

// Keeps three.js out of this test; the stage has its own.
vi.mock('../three/devices/DeviceStage', () => ({ default: () => null }))

describe('Projects', () => {
  it('keeps the projects anchor the nav links to', () => {
    const { container } = render(<Projects />)
    expect(container.querySelector('section#projects')).not.toBeNull()
  })

  it('introduces the section before the showcase', () => {
    render(<Projects />)
    expect(screen.getByRole('heading', { level: 2, name: 'Featured Projects' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Projects' })).toBeInTheDocument()
  })

  it('shows every featured project', () => {
    render(<Projects />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(11)
  })
})

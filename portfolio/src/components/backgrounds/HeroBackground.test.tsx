import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HeroBackground } from './HeroBackground'

const failing = vi.hoisted(() => ({ id: '' }))

// Each background needs WebGL and has its own tests; here only the choice matters.
vi.mock('./labBackgrounds', () => ({
  LabBackground: ({ id }: { id: string }) => {
    if (id === failing.id) throw new Error(`${id} failed`)
    return <div data-testid="background" data-id={id} />
  },
}))

function visit(search: string): void {
  window.history.replaceState(null, '', `/${search}`)
}

describe('HeroBackground', () => {
  afterEach(() => {
    failing.id = ''
    visit('')
    vi.restoreAllMocks()
  })

  it('shows the sphere and no picker outside the lab, whatever the URL says', () => {
    visit('?bg=galaxy')
    render(<HeroBackground theme="dark" labEnabled={false} />)
    expect(screen.getByTestId('background')).toHaveAttribute('data-id', 'sphere')
    expect(screen.queryByRole('group', { name: 'Hero background' })).not.toBeInTheDocument()
  })

  it('opens on the background named in the URL', () => {
    visit('?bg=galaxy')
    render(<HeroBackground theme="dark" labEnabled />)
    expect(screen.getByTestId('background')).toHaveAttribute('data-id', 'galaxy')
    expect(screen.getByRole('button', { name: 'Galaxy' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches background and keeps the choice in the URL', () => {
    render(<HeroBackground theme="dark" labEnabled />)
    fireEvent.click(screen.getByRole('button', { name: 'Orb' }))
    expect(screen.getByTestId('background')).toHaveAttribute('data-id', 'orb')
    expect(window.location.search).toBe('?bg=orb')

    fireEvent.click(screen.getByRole('button', { name: 'Sphere' }))
    expect(screen.getByTestId('background')).toHaveAttribute('data-id', 'sphere')
    expect(window.location.search).toBe('')
  })

  it('keeps other params and the hash when it records the choice', () => {
    visit('?utm=x#about')
    render(<HeroBackground theme="dark" labEnabled />)
    fireEvent.click(screen.getByRole('button', { name: 'Orb' }))
    expect(window.location.search).toBe('?utm=x&bg=orb')
    expect(window.location.hash).toBe('#about')
  })

  it('recovers when you switch away from a background that failed', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    failing.id = 'orb'
    visit('?bg=orb')
    render(<HeroBackground theme="dark" labEnabled />)
    expect(screen.queryByTestId('background')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Galaxy' }))
    expect(screen.getByTestId('background')).toHaveAttribute('data-id', 'galaxy')
  })
})

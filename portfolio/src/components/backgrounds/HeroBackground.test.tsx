import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HeroBackground } from './HeroBackground'

interface ParticlesStandInProps {
  particleColors?: string[]
  connections?: boolean
  lightMode?: boolean
}

// The real particles need WebGL and have their own StrictMode test; this
// stand-in exposes the props the hero gives them.
vi.mock('./react-bits/Particles', () => ({
  default: ({ particleColors, connections, lightMode }: ParticlesStandInProps) => (
    <div
      data-testid="particles"
      data-colors={particleColors?.join(' ')}
      data-connections={String(connections)}
      data-light={String(lightMode)}
    />
  ),
}))

describe('HeroBackground', () => {
  it('draws the particles in the site palette, joined by lines', async () => {
    render(<HeroBackground theme="dark" />)
    const particles = await screen.findByTestId('particles')
    expect(particles).toHaveAttribute('data-colors', '#818cf8 #22d3ee #6366f1')
    expect(particles).toHaveAttribute('data-connections', 'true')
    expect(particles).toHaveAttribute('data-light', 'false')
  })

  it('puts the particles in their light mode on the light theme', async () => {
    render(<HeroBackground theme="light" />)
    expect(await screen.findByTestId('particles')).toHaveAttribute('data-light', 'true')
  })

  it('keeps the layer decorative: hidden from assistive tech and click-through', async () => {
    render(<HeroBackground theme="dark" />)
    const layer = (await screen.findByTestId('particles')).closest('[aria-hidden="true"]')
    expect(layer).toHaveClass('pointer-events-none', 'absolute', 'inset-0')
  })

  it('has no background picker, even in development', async () => {
    render(<HeroBackground theme="dark" />)
    await screen.findByTestId('particles')
    expect(screen.queryByRole('group', { name: 'Hero background' })).not.toBeInTheDocument()
  })
})

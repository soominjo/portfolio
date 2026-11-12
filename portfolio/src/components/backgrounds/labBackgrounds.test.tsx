import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { describe, expect, it, vi } from 'vitest'
import type { Theme } from '../../hooks/useTheme'
import { BACKGROUND_OPTIONS, type BackgroundId } from './backgroundLab'
import { LabBackground } from './labBackgrounds'

// The real backgrounds need WebGL; these stand-ins expose the props they get.
vi.mock('../three/DisplacementSphere', () => ({
  default: ({ theme }: { theme: string }) => <div data-testid="sphere" data-theme={theme} />,
}))
vi.mock('./react-bits/Orb', () => ({
  default: ({ colors }: { colors: string[] }) => <div data-testid="orb" data-colors={colors.join(' ')} />,
}))
vi.mock('./react-bits/Galaxy', () => ({
  default: ({ lightMode }: { lightMode?: boolean }) => <div data-testid="galaxy" data-light={String(lightMode)} />,
}))
vi.mock('./react-bits/Particles', () => ({
  default: ({ lightMode }: { lightMode?: boolean }) => (
    <div data-testid="particles" data-light={String(lightMode)} />
  ),
}))
vi.mock('./react-bits/Topography', () => ({
  default: ({ lightMode }: { lightMode?: boolean }) => (
    <div data-testid="topography" data-light={String(lightMode)} />
  ),
}))
vi.mock('./react-bits/GridScan', () => ({
  default: ({ enableWebcam }: { enableWebcam?: boolean }) => (
    <div data-testid="grid-scan" data-webcam={String(enableWebcam)} />
  ),
}))

function renderBackground(id: BackgroundId, theme: Theme = 'dark'): void {
  render(
    <Suspense fallback={null}>
      <LabBackground id={id} theme={theme} />
    </Suspense>,
  )
}

describe('LabBackground', () => {
  it.each(BACKGROUND_OPTIONS.map((option) => option.id))('renders the %s background', async (id) => {
    renderBackground(id)
    expect(await screen.findByTestId(id)).toBeInTheDocument()
  })

  it('passes the theme to the sphere', async () => {
    renderBackground('sphere', 'light')
    expect(await screen.findByTestId('sphere')).toHaveAttribute('data-theme', 'light')
  })

  it('colours the orb with the site palette', async () => {
    renderBackground('orb')
    expect(await screen.findByTestId('orb')).toHaveAttribute('data-colors', '#6366f1 #22d3ee #1e1b4b')
  })

  it('dims the orb on the light theme, since it has no light mode', async () => {
    renderBackground('orb', 'light')
    const layer = (await screen.findByTestId('orb')).closest('[aria-hidden="true"]')
    expect(layer).toHaveStyle({ opacity: '0.35' })
  })

  it('puts the others in their own light mode on the light theme', async () => {
    renderBackground('topography', 'light')
    expect(await screen.findByTestId('topography')).toHaveAttribute('data-light', 'true')
  })

  it('keeps the grid scan webcam off', async () => {
    renderBackground('grid-scan')
    expect(await screen.findByTestId('grid-scan')).toHaveAttribute('data-webcam', 'false')
  })

  it('hides the decorative layer from assistive tech', async () => {
    renderBackground('galaxy')
    expect((await screen.findByTestId('galaxy')).closest('[aria-hidden="true"]')).not.toBeNull()
  })
})

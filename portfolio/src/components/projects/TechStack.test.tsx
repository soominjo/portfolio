import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TechStack } from './TechStack'

const FLINKI_STACK = ['Flutter', 'Dart', 'React', 'Node.js', 'TypeScript', 'Cloud SQL', 'Genkit', 'TryTerra', 'Mapbox']
const QA_PRACTICES = ['Manual Testing', 'Functional Testing', 'Regression Testing', 'Accessibility Testing']

function tileLabels(): (string | null)[] {
  return screen.getAllByRole('img').map((tile) => tile.getAttribute('aria-label'))
}

describe('TechStack', () => {
  it('shows six logo tiles and counts the rest', () => {
    render(<TechStack items={FLINKI_STACK} variant="icons" />)
    expect(tileLabels()).toEqual(['Flutter', 'Dart', 'React', 'Node.js', 'TypeScript', 'Cloud SQL'])
    expect(screen.getByText('+3 more')).toBeInTheDocument()
    expect(screen.getByText('Also: Genkit, TryTerra, Mapbox')).toBeInTheDocument()
  })

  it('draws the brand mark for tech that has one', () => {
    render(<TechStack items={['React']} variant="icons" />)
    const path = screen.getByRole('img', { name: 'React' }).querySelector('svg path')
    expect(path?.getAttribute('d')).toMatch(/^M/)
  })

  it('labels a logo-less tile with its initials', () => {
    render(<TechStack items={['Zustand']} variant="icons" />)
    const tile = screen.getByRole('img', { name: 'Zustand' })
    expect(tile).toHaveTextContent('Zu')
    expect(tile.querySelector('svg')).toBeNull()
  })

  it('keeps a black mark readable on the dark tile and leaves it black on the light one', () => {
    render(<TechStack items={['Next.js']} variant="icons" />)
    const svg = screen.getByRole('img', { name: 'Next.js' }).querySelector('svg') as SVGElement
    expect(svg.style.getPropertyValue('--mark-dark')).toBe('#e2e8f0')
    expect(svg.style.getPropertyValue('--mark-light')).toBe('#000000')
  })

  it('shows QA practices as chips', () => {
    render(<TechStack items={QA_PRACTICES} variant="chips" />)
    const list = screen.getByRole('list', { name: 'Tech stack' })
    expect(within(list).getAllByRole('listitem').map((item) => item.textContent)).toEqual(QA_PRACTICES)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.queryByText(/more$/)).toBeNull()
  })

  it('caps chips at four', () => {
    render(<TechStack items={[...QA_PRACTICES, 'E2E Testing', 'API Testing']} variant="chips" />)
    expect(screen.getByText('+2 more')).toBeInTheDocument()
    expect(screen.getByText('Also: E2E Testing, API Testing')).toBeInTheDocument()
  })
})

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TechStack } from './TechStack'

const FLINKI_STACK = ['Flutter', 'Dart', 'React', 'Node.js', 'TypeScript', 'Cloud SQL', 'Genkit', 'TryTerra', 'Mapbox']
const QA_PRACTICES = ['Manual Testing', 'Functional Testing', 'Regression Testing', 'Accessibility Testing']

const mouse = { pointerType: 'mouse' }
const touch = { pointerType: 'touch' }

function tileLabels(): (string | null)[] {
  return screen.getAllByRole('img').map((tile) => tile.getAttribute('aria-label'))
}

/** The list item that holds a logo tile and takes its pointer events. */
function tech(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-skill="${name}"]`)
  if (!element) throw new Error(`No tile rendered for "${name}"`)
  return element
}

function tooltip(): HTMLElement | null {
  return screen.queryByTestId('skill-tooltip')
}

function hover(name: string): void {
  fireEvent.pointerEnter(tech(name), mouse)
}

function tap(name: string): void {
  fireEvent.pointerDown(tech(name), touch)
  fireEvent.click(tech(name))
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
    expect(tech('Next.js').style.getPropertyValue('--mark-dark')).toBe('#e2e8f0')
    expect(tech('Next.js').style.getPropertyValue('--mark-light')).toBe('#000000')
  })

  it('tints a logo-less tile with the cyan accent', () => {
    render(<TechStack items={['Zustand']} variant="icons" />)
    expect(tech('Zustand').style.getPropertyValue('--mark-dark')).toBe('#22d3ee')
    expect(tech('Zustand').style.getPropertyValue('--mark-light')).toBe('#0891b2')
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

  describe('hovering a logo, as in the About tech stack', () => {
    it('shows its name above it and dims the other logos', () => {
      render(<TechStack items={['React', 'Next.js', 'Zustand']} variant="icons" />)
      expect(tooltip()).toBeNull()

      hover('React')

      expect(tooltip()).toHaveTextContent('React')
      expect(within(tech('React')).getByTestId('skill-tooltip')).toBeInTheDocument()
      expect(tech('React')).toHaveAttribute('data-state', 'active')
      expect(tech('Next.js')).toHaveAttribute('data-state', 'dimmed')
      expect(tech('Zustand')).toHaveAttribute('data-state', 'dimmed')
    })

    it('keeps the tooltip visual only, since the tile already names itself', () => {
      render(<TechStack items={['React']} variant="icons" />)
      hover('React')
      expect(tooltip()).toHaveAttribute('aria-hidden', 'true')
    })

    it('drops the browser title tooltip, so the name never shows twice', () => {
      render(<TechStack items={['React']} variant="icons" />)
      expect(screen.getByRole('img', { name: 'React' })).not.toHaveAttribute('title')
    })

    it('names a logo-less tile too', () => {
      render(<TechStack items={['Zustand']} variant="icons" />)
      hover('Zustand')
      expect(tooltip()).toHaveTextContent('Zustand')
    })

    it('hides the name shortly after the pointer leaves', async () => {
      render(<TechStack items={['React', 'Next.js']} variant="icons" />)
      hover('React')

      fireEvent.pointerLeave(tech('React'), mouse)

      await waitFor(() => expect(tech('React')).toHaveAttribute('data-state', 'rest'))
      await waitFor(() => expect(tooltip()).toBeNull())
    })

    it('toggles the name with a tap on touch screens', () => {
      render(<TechStack items={['React', 'Next.js']} variant="icons" />)

      tap('React')
      expect(tooltip()).toHaveTextContent('React')

      tap('React')
      expect(tech('React')).toHaveAttribute('data-state', 'rest')
    })

    it('dismisses the name on Escape', async () => {
      render(<TechStack items={['React']} variant="icons" />)
      hover('React')

      fireEvent.keyDown(document, { key: 'Escape' })

      expect(tech('React')).toHaveAttribute('data-state', 'rest')
      await waitFor(() => expect(tooltip()).toBeNull())
    })

    it('drops the highlight once its panel is hidden, so it never comes back stale', async () => {
      const { rerender } = render(<TechStack items={['React', 'Next.js']} variant="icons" />)
      hover('React')

      rerender(<TechStack items={['React', 'Next.js']} variant="icons" visible={false} />)

      expect(tech('React')).toHaveAttribute('data-state', 'rest')
      expect(tech('Next.js')).toHaveAttribute('data-state', 'rest')
      await waitFor(() => expect(tooltip()).toBeNull())
    })

    it('leaves QA chips alone, since they already show their names', () => {
      render(<TechStack items={QA_PRACTICES} variant="chips" />)
      expect(document.querySelector('[data-skill]')).toBeNull()
    })
  })

  describe('hovering "+N more"', () => {
    function more(): HTMLElement {
      const chip = screen.getByText(/^\+\d+ more$/).closest<HTMLElement>('[data-skill]')
      if (!chip) throw new Error('"+N more" does not respond to hover')
      return chip
    }

    it('names the hidden tech above it and dims the logos', () => {
      render(<TechStack items={FLINKI_STACK} variant="icons" />)

      fireEvent.pointerEnter(more(), mouse)

      expect(tooltip()).toHaveTextContent('Genkit, TryTerra, Mapbox')
      expect(within(more()).getByTestId('skill-tooltip')).toHaveAttribute('aria-hidden', 'true')
      expect(more()).toHaveAttribute('data-state', 'active')
      expect(tech('Flutter')).toHaveAttribute('data-state', 'dimmed')
    })

    it('toggles the hidden names with a tap on touch screens', () => {
      render(<TechStack items={FLINKI_STACK} variant="icons" />)

      fireEvent.pointerDown(more(), touch)
      fireEvent.click(more())
      expect(tooltip()).toHaveTextContent('Genkit, TryTerra, Mapbox')

      fireEvent.pointerDown(more(), touch)
      fireEvent.click(more())
      expect(more()).toHaveAttribute('data-state', 'rest')
    })

    it('names hidden QA practices too', () => {
      render(<TechStack items={[...QA_PRACTICES, 'E2E Testing', 'API Testing']} variant="chips" />)

      fireEvent.pointerEnter(more(), mouse)

      expect(tooltip()).toHaveTextContent('E2E Testing, API Testing')
    })
  })
})

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SkillGroup } from '../../../../shared/data/skills'
import { intersection, reducedMotion } from '../../test/controls'
import { TechStack } from './TechStack'
import { LEAVE_DELAY_MS } from './useActiveSkill'

const groups: SkillGroup[] = [
  { category: 'Frontend', icon: '⬡', skills: ['React', 'Zustand', 'Next.js'] },
  { category: 'QA & DevOps', icon: '◇', skills: ['Vitest', 'Playwright'] },
]

const mouse = { pointerType: 'mouse' }
const touch = { pointerType: 'touch' }

function skill(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-skill="${name}"]`)
  if (!element) throw new Error(`No skill rendered for "${name}"`)
  return element
}

function tooltip(): HTMLElement | null {
  return screen.queryByTestId('skill-tooltip')
}

function hover(name: string): void {
  fireEvent.pointerEnter(skill(name), mouse)
}

function tap(element: Element): void {
  fireEvent.pointerDown(element, touch)
  fireEvent.click(element)
}

function pause(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

describe('TechStack', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('titles the block and labels one list per category', () => {
    render(<TechStack groups={groups} />)

    expect(screen.getByRole('heading', { name: 'What I Work With' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Frontend' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Frontend' })).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'QA & DevOps' })).toBeInTheDocument()
    expect(screen.getByText('3 skills')).toBeInTheDocument()
  })

  it('draws a logo when one exists and plain text otherwise', () => {
    render(<TechStack groups={groups} />)

    expect(skill('React').querySelector('svg')).not.toBeNull()
    expect(skill('React').querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(skill('Zustand').querySelector('svg')).toBeNull()
    expect(within(skill('Zustand')).getByText('Zustand')).toBeInTheDocument()
  })

  it('lists logos before text in each row', () => {
    render(<TechStack groups={groups} />)

    const order = [...screen.getByRole('list', { name: 'Frontend' }).children].map((item) =>
      item.getAttribute('data-skill'),
    )
    expect(order).toEqual(['React', 'Next.js', 'Zustand'])
  })

  it('names every logo for assistive tech', () => {
    render(<TechStack groups={groups} />)

    const frontend = screen.getByRole('list', { name: 'Frontend' })
    for (const name of ['React', 'Next.js', 'Zustand']) {
      expect(within(frontend).getByText(name)).toBeInTheDocument()
    }
  })

  it('shows the name above a logo while it is hovered', () => {
    render(<TechStack groups={groups} />)
    expect(tooltip()).toBeNull()

    hover('React')

    expect(tooltip()).toHaveTextContent('React')
    expect(within(skill('React')).getByTestId('skill-tooltip')).toBeInTheDocument()
    // The tile already names itself for assistive tech; the tooltip is visual only.
    expect(tooltip()).toHaveAttribute('aria-hidden', 'true')
  })

  it('slides the tooltip back on screen next to the edge', () => {
    // A 44px tile at the far left of a 320px screen, under a 100px-wide tooltip.
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0, right: 44, top: 0, bottom: 44, width: 44, height: 44, x: 0, y: 0, toJSON: () => ({}),
    })
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100)
    vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(320)
    render(<TechStack groups={groups} />)

    hover('React')

    // Centred on the tile its left edge would sit at -28px; it moves to the 8px margin.
    const bubble = tooltip()?.firstElementChild as HTMLElement
    expect(bubble.style.left).toBe('36px')
  })

  it('hides the name shortly after the pointer leaves', async () => {
    render(<TechStack groups={groups} />)
    hover('React')

    fireEvent.pointerLeave(skill('React'), mouse)

    expect(skill('React')).toHaveAttribute('data-state', 'active')
    await waitFor(() => expect(skill('React')).toHaveAttribute('data-state', 'rest'))
    await waitFor(() => expect(tooltip()).toBeNull())
  })

  it('moves straight to the next logo without dropping the highlight in between', async () => {
    render(<TechStack groups={groups} />)
    hover('React')

    fireEvent.pointerLeave(skill('React'), mouse)
    hover('Next.js')
    await pause(LEAVE_DELAY_MS + 50)

    expect(skill('Next.js')).toHaveAttribute('data-state', 'active')
    expect(skill('React')).toHaveAttribute('data-state', 'dimmed')
  })

  it('dims the rest of the hovered row and leaves other rows alone', () => {
    render(<TechStack groups={groups} />)

    hover('React')

    expect(skill('React')).toHaveAttribute('data-state', 'active')
    expect(skill('Next.js')).toHaveAttribute('data-state', 'dimmed')
    expect(skill('Zustand')).toHaveAttribute('data-state', 'dimmed')
    expect(skill('Vitest')).toHaveAttribute('data-state', 'rest')
  })

  it('dismisses the name on Escape', () => {
    render(<TechStack groups={groups} />)
    hover('React')

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(skill('React')).toHaveAttribute('data-state', 'rest')
  })

  it('ignores keys other than Escape', () => {
    render(<TechStack groups={groups} />)
    hover('React')

    fireEvent.keyDown(document, { key: 'Enter' })

    expect(skill('React')).toHaveAttribute('data-state', 'active')
  })

  it('toggles the name with a tap on touch screens', () => {
    render(<TechStack groups={groups} />)

    fireEvent.pointerEnter(skill('React'), touch)
    expect(skill('React')).toHaveAttribute('data-state', 'rest')

    tap(skill('React'))
    expect(tooltip()).toHaveTextContent('React')

    tap(skill('React'))
    expect(skill('React')).toHaveAttribute('data-state', 'rest')
  })

  it('moves the name to another logo when that one is tapped', () => {
    render(<TechStack groups={groups} />)
    tap(skill('React'))

    tap(skill('Next.js'))

    expect(skill('Next.js')).toHaveAttribute('data-state', 'active')
    expect(skill('React')).toHaveAttribute('data-state', 'dimmed')
  })

  it('dismisses a tapped name when tapping anywhere else', () => {
    render(<TechStack groups={groups} />)
    tap(skill('React'))

    fireEvent.pointerDown(document.body, touch)

    expect(skill('React')).toHaveAttribute('data-state', 'rest')
  })

  it('treats a pen like touch, toggling the name with a tap', () => {
    render(<TechStack groups={groups} />)
    const pen = { pointerType: 'pen' }

    fireEvent.pointerEnter(skill('React'), pen)
    expect(skill('React')).toHaveAttribute('data-state', 'rest')

    fireEvent.pointerDown(skill('React'), pen)
    fireEvent.click(skill('React'))
    expect(skill('React')).toHaveAttribute('data-state', 'active')
  })

  it('leaves a mouse click to the hover state', () => {
    render(<TechStack groups={groups} />)
    hover('React')

    fireEvent.pointerDown(skill('React'), mouse)
    fireEvent.click(skill('React'))

    expect(skill('React')).toHaveAttribute('data-state', 'active')
  })

  it('switches every skill to text and back', () => {
    render(<TechStack groups={groups} />)
    const logos = screen.getByRole('button', { name: 'Logos' })
    const text = screen.getByRole('button', { name: 'Text' })
    expect(logos).toHaveAttribute('aria-pressed', 'true')
    expect(text).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(text)

    expect(text).toHaveAttribute('aria-pressed', 'true')
    expect(logos).toHaveAttribute('aria-pressed', 'false')
    expect(skill('React').querySelector('svg')).toBeNull()
    expect(within(skill('React')).getByText('React')).toBeInTheDocument()

    fireEvent.click(logos)

    expect(skill('React').querySelector('svg')).not.toBeNull()
  })

  it('drops the highlight when the view changes, even with no pointer move', () => {
    render(<TechStack groups={groups} />)
    hover('React')

    // A keyboard press on the toggle: a click with no pointerdown before it.
    fireEvent.click(screen.getByRole('button', { name: 'Text' }))

    expect(skill('React')).toHaveAttribute('data-state', 'rest')
    expect(skill('Next.js')).toHaveAttribute('data-state', 'rest')
  })

  it('shows no tooltip in the text view, where names are already visible', () => {
    render(<TechStack groups={groups} />)
    fireEvent.click(screen.getByRole('button', { name: 'Text' }))

    hover('React')

    expect(skill('React')).toHaveAttribute('data-state', 'active')
    expect(tooltip()).toBeNull()
  })

  it('offers the hover hint only while logos are shown', () => {
    render(<TechStack groups={groups} />)
    // Keyboard users can't hover, so the hint also points at the text view.
    expect(screen.getByText(/a logo for its name, or switch to Text/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Text' }))

    expect(screen.queryByText(/a logo for its name/)).toBeNull()
  })

  it('spells the name out at once when reduced motion is preferred', () => {
    reducedMotion.value = true
    render(<TechStack groups={groups} />)

    hover('React')

    expect(within(tooltip() as HTMLElement).getByTestId('decoder-output')).toHaveTextContent('React')
  })

  it('fades every skill in once its row scrolls into view', async () => {
    intersection.isIntersecting = true
    render(<TechStack groups={groups} />)

    for (const name of ['React', 'Next.js', 'Zustand', 'Vitest', 'Playwright']) {
      await waitFor(() => expect(skill(name)).toHaveStyle({ opacity: '1' }))
    }
  })

  it('renders the shared skill list by default', () => {
    render(<TechStack />)
    expect(screen.getByRole('list', { name: 'Frontend' })).toBeInTheDocument()
    expect(skill('Playwright')).toBeInTheDocument()
  })
})

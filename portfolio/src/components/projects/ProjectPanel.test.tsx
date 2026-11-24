import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { metaLine, titleSizeClass } from './panelText'
import { ProjectPanel } from './ProjectPanel'
import { ENGINEERING_PROJECT, QA_PROJECT } from './testProjects'

interface Overrides {
  project?: typeof ENGINEERING_PROJECT
  index?: number
  active?: boolean
  fit?: 'regular' | 'compact' | 'tiny'
}

function renderPanel({ project = ENGINEERING_PROJECT, index = 0, active = true, fit = 'regular' }: Overrides = {}) {
  const onOpenDetails = vi.fn()
  const onFocusInactive = vi.fn()
  render(
    <ProjectPanel
      project={project}
      index={index}
      total={11}
      active={active}
      fit={fit}
      onOpenDetails={onOpenDetails}
      onFocusInactive={onFocusInactive}
    />,
  )
  return { onOpenDetails, onFocusInactive }
}

function panel(): HTMLElement {
  return screen.getByRole('article')
}

describe('ProjectPanel', () => {
  it('shows the index, meta line, title and tagline', () => {
    renderPanel()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('/ 11')).toBeInTheDocument()
    expect(screen.getByText('External Project · Full-Stack Developer')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: 'Flinki' })).toBeInTheDocument()
    expect(screen.getByText(ENGINEERING_PROJECT.tagline)).toBeInTheDocument()
  })

  it('uses logo tiles for engineering and chips for QA', () => {
    renderPanel()
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
  })

  it('shows QA practices as chips, not logos', () => {
    renderPanel({ project: QA_PROJECT })
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByText('Manual Testing')).toBeInTheDocument()
    expect(screen.getByText('Personal Project · QA Engineer')).toBeInTheDocument()
  })

  it('marks whether it is the active panel', () => {
    renderPanel({ active: false })
    expect(screen.getByRole('article', { hidden: true })).toHaveAttribute('data-active', 'false')
  })

  it('asks to activate when an inactive panel gets focus', () => {
    const { onFocusInactive } = renderPanel({ active: false, index: 3 })
    act(() => screen.getByRole('button', { name: 'View more about Flinki' }).focus())
    expect(onFocusInactive).toHaveBeenCalledWith(3)
  })

  it('does not ask to activate when it is already active', () => {
    const { onFocusInactive } = renderPanel({ active: true })
    act(() => screen.getByRole('button', { name: 'View more about Flinki' }).focus())
    expect(onFocusInactive).not.toHaveBeenCalled()
  })

  it('opens details from View more', () => {
    const { onOpenDetails } = renderPanel()
    fireEvent.click(screen.getByRole('button', { name: 'View more about Flinki' }))
    expect(onOpenDetails).toHaveBeenCalledWith(ENGINEERING_PROJECT)
  })

  it('links to the live site in a new tab', () => {
    renderPanel()
    const link = screen.getByRole('link', { name: 'Visit site for Flinki (opens in a new tab)' })
    expect(link).toHaveAttribute('href', 'https://flinki.co/')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows no site link for a project without a live site', () => {
    renderPanel({ project: QA_PROJECT })
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('clears a highlighted logo when the panel stops being the active one', () => {
    const props = { project: ENGINEERING_PROJECT, index: 0, total: 11, onOpenDetails: vi.fn(), onFocusInactive: vi.fn() }
    const { rerender } = render(<ProjectPanel {...props} active />)
    const react = document.querySelector('[data-skill="React"]') as HTMLElement
    fireEvent.pointerEnter(react, { pointerType: 'mouse' })
    expect(react).toHaveAttribute('data-state', 'active')

    rerender(<ProjectPanel {...props} active={false} />)

    expect(react).toHaveAttribute('data-state', 'rest')
  })

  it('gives the title its size class', () => {
    renderPanel()
    expect(screen.getByRole('heading', { level: 3 }).className).toContain(titleSizeClass('Flinki'))
  })

  // jsdom can't hit-test, so these pin the classes a real browser hit-tests with.
  it('takes clicks only while it is the visible panel', () => {
    renderPanel({ active: true })
    expect(panel()).toHaveClass('pointer-events-auto')
  })

  it('lets clicks through while it is hidden', () => {
    renderPanel({ active: false })
    expect(panel()).toHaveClass('pointer-events-none')
  })

  it('shows itself at once while it holds keyboard focus', () => {
    renderPanel({ active: false })
    expect(panel()).toHaveClass('focus-within:opacity-100')
  })

  it('tightens the type on short screens', () => {
    renderPanel({ fit: 'compact' })
    const heading = screen.getByRole('heading', { level: 3 })
    expect(heading.className).toContain(titleSizeClass('Flinki', 'compact'))
    expect(heading.className).not.toContain(titleSizeClass('Flinki', 'regular'))
  })
})

describe('metaLine', () => {
  it.each([
    ['internal', 'Internal System · Full-Stack Developer'],
    ['external', 'External Project · Full-Stack Developer'],
    ['personal', 'Personal Project · Full-Stack Developer'],
  ] as const)('labels the %s type', (type, line) => {
    expect(metaLine({ type, role: 'Full-Stack Developer' })).toBe(line)
  })
})

describe('titleSizeClass', () => {
  it('steps the type down at 13 and 19 characters', () => {
    const large = titleSizeClass('x'.repeat(12))
    const medium = titleSizeClass('x'.repeat(13))
    const small = titleSizeClass('x'.repeat(19))
    expect(new Set([large, medium, small]).size).toBe(3)
    expect(titleSizeClass('x'.repeat(18))).toBe(medium)
    expect(titleSizeClass('Commission Monitoring System')).toBe(small)
  })
})

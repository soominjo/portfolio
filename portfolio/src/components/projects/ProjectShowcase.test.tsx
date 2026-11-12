import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import type { Project } from '../../../../shared/types/project'
import { intersection, reducedMotion } from '../../test/controls'
import type { DeviceSlide } from '../three/devices/deviceTypes'
import { ProjectShowcase } from './ProjectShowcase'
import { LAST_STEP_CLASS, STEP_CLASS, TRACK_OFFSET_CLASS } from './showcaseGeometry'
import { ENGINEERING_PROJECT, QA_PROJECT, installDialogPolyfill, mockMediaQueries } from './testProjects'
import { COMPACT_QUERY, TINY_QUERY } from './useViewportFit'

const stage = vi.hoisted(() => ({ props: null as { slides: DeviceSlide[]; activeIndex: number } | null }))

// The real stage needs WebGL; this stand-in records what it was given.
vi.mock('../three/devices/DeviceStage', () => ({
  default: (props: { slides: DeviceSlide[]; activeIndex: number }) => {
    stage.props = props
    return <div data-testid="device-stage" />
  },
}))

const CMS: Project = { ...ENGINEERING_PROJECT, id: 'cms', title: 'Commission Monitoring System', showPhone: false, order: 2 }
const TMS: Project = { ...QA_PROJECT, id: 'tms', title: 'Talent Management System', order: 3 }
const MYTHICA: Project = { ...QA_PROJECT, id: 'mythica', title: 'Mythica', order: 4 }
// Deliberately shuffled: the showcase orders them itself.
const PROJECTS = [QA_PROJECT, CMS, MYTHICA, ENGINEERING_PROJECT, TMS]

const scrollIntoView: Mock = vi.fn()
const originalScrollIntoView = Element.prototype.scrollIntoView

function scrolledTo(): string[] {
  return scrollIntoView.mock.contexts.map((element) => (element as Element).id)
}

function article(title: string): HTMLElement {
  return screen.getByRole('heading', { name: title }).closest('article') as HTMLElement
}

describe('ProjectShowcase', () => {
  beforeAll(() => {
    installDialogPolyfill()
    Element.prototype.scrollIntoView = scrollIntoView
  })

  afterAll(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
  })

  beforeEach(() => {
    scrollIntoView.mockClear()
    stage.props = null
  })

  it('renders every project as an article, in showcase order', () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    const titles = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)
    expect(titles).toEqual(['Flinki', 'Commission Monitoring System', 'Talent Management System', 'Mythica', 'Reviva'])
  })

  it('shows the project whose step crosses the middle of the viewport', async () => {
    intersection.byId = { 'project-step-mythica': true }
    render(<ProjectShowcase projects={PROJECTS} />)
    await waitFor(() => expect(article('Mythica')).toHaveAttribute('data-active', 'true'))
    expect(article('Flinki')).toHaveAttribute('data-active', 'false')
  })

  it('starts on the first project', () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    expect(article('Flinki')).toHaveAttribute('data-active', 'true')
  })

  it('scrolls smoothly to a project from the progress bar', () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    fireEvent.click(screen.getByTitle('Talent Management System'))
    expect(scrolledTo()).toEqual(['project-step-tms'])
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'smooth' })
  })

  it('jumps without animation under reduced motion', () => {
    reducedMotion.value = true
    render(<ProjectShowcase projects={PROJECTS} />)
    fireEvent.click(screen.getByTitle('Mythica'))
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
  })

  it('jumps straight to a project when keyboard focus lands on it', () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    act(() => screen.getByRole('button', { name: 'View more about Reviva' }).focus())
    expect(scrolledTo()).toEqual(['project-step-reviva'])
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start', behavior: 'instant' })
  })

  it('lets clicks pass through the stacked panels to the visible one', () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    const items = [...screen.getByRole('list', { name: 'Projects' }).children]
    expect(items).toHaveLength(5)
    for (const item of items) expect(item).toHaveClass('pointer-events-none')
  })

  it('steps the projects down the track by the shared geometry', () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    const first = document.getElementById('project-step-flinki') as HTMLElement
    expect(first).toHaveClass(STEP_CLASS)
    expect(document.getElementById('project-step-reviva')).toHaveClass(LAST_STEP_CLASS)
    expect(first.parentElement).toHaveClass(TRACK_OFFSET_CLASS)
  })

  it('hides the devices and the progress bar on very short screens', () => {
    const media = mockMediaQueries({ [COMPACT_QUERY]: true, [TINY_QUERY]: true })
    try {
      render(<ProjectShowcase projects={PROJECTS} />)
      expect(screen.getByTestId('device-cell')).toHaveClass('hidden')
      expect(screen.getByTitle('Mythica').closest('[aria-hidden="true"]')).toHaveClass('hidden')
    } finally {
      media.restore()
    }
  })

  it('opens the details dialog from View more', () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    fireEvent.click(screen.getByRole('button', { name: 'View more about Flinki' }))
    expect(document.querySelector('dialog')?.open).toBe(true)
    expect(screen.getByRole('heading', { level: 2, name: 'Flinki' })).toBeInTheDocument()
  })

  it('hands the device stage one slide per project', async () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    await screen.findByTestId('device-stage')
    expect(stage.props?.slides.map((slide) => slide.id)).toEqual(['flinki', 'cms', 'tms', 'mythica', 'reviva'])
    expect(stage.props?.slides.find((slide) => slide.id === 'cms')?.showPhone).toBe(false)
    expect(stage.props?.activeIndex).toBe(0)
  })

  it('keeps one scroll step per project for the stage to pin across', () => {
    render(<ProjectShowcase projects={PROJECTS} />)
    const steps = ['flinki', 'cms', 'tms', 'mythica', 'reviva'].map((id) => document.getElementById(`project-step-${id}`))
    expect(steps.every((step) => step !== null)).toBe(true)
  })
})

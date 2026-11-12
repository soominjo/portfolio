import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProgressRail } from './ProgressRail'
import type { ShowcaseGroup } from './showcaseOrder'

const GROUPS: ShowcaseGroup[] = [
  { category: 'engineering', label: 'Engineering', start: 0, end: 6 },
  { category: 'qa', label: 'QA Engineering', start: 6, end: 11 },
]
const TITLES = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'Q1', 'Q2', 'Q3', 'Mythica', 'Q5']

function renderRail(active = 7) {
  const onJump = vi.fn()
  const { container } = render(<ProgressRail groups={GROUPS} titles={TITLES} active={active} onJump={onJump} />)
  return { onJump, container, segments: screen.getAllByRole('button', { hidden: true }) }
}

describe('ProgressRail', () => {
  it('renders one segment per project under its group label', () => {
    const { segments } = renderRail()
    expect(segments).toHaveLength(11)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('QA Engineering')).toBeInTheDocument()
  })

  it('marks past, current and upcoming segments', () => {
    const { segments } = renderRail(7)
    expect(segments[6]).toHaveAttribute('data-state', 'past')
    expect(segments[7]).toHaveAttribute('data-state', 'current')
    expect(segments[8]).toHaveAttribute('data-state', 'upcoming')
  })

  it('highlights the group holding the active project', () => {
    renderRail(7)
    expect(screen.getByText('QA Engineering')).toHaveAttribute('data-active', 'true')
    expect(screen.getByText('Engineering')).toHaveAttribute('data-active', 'false')
  })

  it('jumps when a segment is clicked', () => {
    const { onJump } = renderRail()
    fireEvent.click(screen.getByTitle('Mythica'))
    expect(onJump).toHaveBeenCalledWith(9)
  })

  it('stays out of the tab order and the accessibility tree', () => {
    const { container, segments } = renderRail()
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    for (const segment of segments) expect(segment).toHaveAttribute('tabindex', '-1')
  })
})

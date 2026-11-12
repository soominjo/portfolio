import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { ProjectDetailsDialog } from './ProjectDetailsDialog'
import { ENGINEERING_PROJECT, QA_PROJECT, installDialogPolyfill } from './testProjects'

beforeAll(installDialogPolyfill)

function dialog(): HTMLDialogElement {
  return document.querySelector('dialog') as HTMLDialogElement
}

describe('ProjectDetailsDialog', () => {
  it('stays closed without a project', () => {
    render(<ProjectDetailsDialog project={null} onClose={vi.fn()} />)
    expect(dialog().open).toBe(false)
  })

  it('opens with the full description and every tech item', () => {
    render(<ProjectDetailsDialog project={ENGINEERING_PROJECT} onClose={vi.fn()} />)
    expect(dialog().open).toBe(true)
    expect(screen.getByRole('heading', { level: 2, name: 'Flinki' })).toBeInTheDocument()
    expect(screen.getByText(ENGINEERING_PROJECT.purpose)).toBeInTheDocument()
    for (const tech of ENGINEERING_PROJECT.techStack) expect(screen.getByText(tech)).toBeInTheDocument()
  })

  it('shows the mobile screenshot only when there is one', () => {
    const { rerender } = render(<ProjectDetailsDialog project={ENGINEERING_PROJECT} onClose={vi.fn()} />)
    expect(screen.getByAltText('Flinki on desktop')).toHaveAttribute('src', '/projects/flinki.webp')
    expect(screen.getByAltText('Flinki on mobile')).toHaveAttribute('src', '/projects/flinki-mobile.webp')
    rerender(<ProjectDetailsDialog project={QA_PROJECT} onClose={vi.fn()} />)
    expect(screen.queryByAltText('Reviva on mobile')).toBeNull()
  })

  it('closes when the project goes back to null', () => {
    const { rerender } = render(<ProjectDetailsDialog project={ENGINEERING_PROJECT} onClose={vi.fn()} />)
    rerender(<ProjectDetailsDialog project={null} onClose={vi.fn()} />)
    expect(dialog().open).toBe(false)
  })

  it('reports closing from the Close button', () => {
    const onClose = vi.fn()
    render(<ProjectDetailsDialog project={ENGINEERING_PROJECT} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('reports closing when the browser closes it, e.g. on Escape', () => {
    const onClose = vi.fn()
    render(<ProjectDetailsDialog project={ENGINEERING_PROJECT} onClose={onClose} />)
    fireEvent(dialog(), new Event('close'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a click on the backdrop but not inside the panel', () => {
    const onClose = vi.fn()
    render(<ProjectDetailsDialog project={ENGINEERING_PROJECT} onClose={onClose} />)
    fireEvent.click(screen.getByText(ENGINEERING_PROJECT.purpose))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(dialog())
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

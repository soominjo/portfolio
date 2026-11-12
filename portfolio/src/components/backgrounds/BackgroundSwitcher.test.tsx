import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BACKGROUND_OPTIONS } from './backgroundLab'
import { BackgroundSwitcher } from './BackgroundSwitcher'

describe('BackgroundSwitcher', () => {
  it('offers every background and marks the current one', () => {
    render(<BackgroundSwitcher value="galaxy" onChange={() => {}} />)
    const group = screen.getByRole('group', { name: 'Hero background' })
    const labels = within(group)
      .getAllByRole('button')
      .map((button) => button.textContent)
    expect(labels).toEqual(BACKGROUND_OPTIONS.map((option) => option.label))
    expect(screen.getByRole('button', { name: 'Galaxy' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Sphere' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('reports the background you pick', () => {
    const onChange = vi.fn()
    render(<BackgroundSwitcher value="sphere" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Grid Scan' }))
    expect(onChange).toHaveBeenCalledWith('grid-scan')
  })

  it('renders into the body so the hero cannot clip it', () => {
    const { container } = render(<BackgroundSwitcher value="sphere" onChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
    expect(document.body).toContainElement(screen.getByRole('group', { name: 'Hero background' }))
  })
})

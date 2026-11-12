import { act, fireEvent, render, screen } from '@testing-library/react'
import { useEffect, useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { useEngagement } from './useEngagement'

function Harness({ quietFocus = false }: { quietFocus?: boolean }) {
  const { engaged, hovered, handlers, focusQuietly } = useEngagement()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (quietFocus) focusQuietly(inputRef.current)
  }, [quietFocus, focusQuietly])

  return (
    <>
      <div data-testid="panel" data-engaged={engaged} data-hovered={hovered} {...handlers}>
        <input ref={inputRef} aria-label="Message" />
        <button type="button">inside</button>
      </div>
      <button type="button">outside</button>
    </>
  )
}

const panel = () => screen.getByTestId('panel')

describe('useEngagement', () => {
  it('starts disengaged and ignores quiet focus', () => {
    render(<Harness quietFocus />)
    expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus()
    expect(panel()).toHaveAttribute('data-engaged', 'false')
  })

  it('engages when the visitor types', () => {
    render(<Harness />)
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message' }), { key: 'a' })
    expect(panel()).toHaveAttribute('data-engaged', 'true')
  })

  it('engages on a press inside', () => {
    render(<Harness />)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'inside' }))
    expect(panel()).toHaveAttribute('data-engaged', 'true')
  })

  it('engages when the visitor moves focus in', () => {
    render(<Harness />)
    act(() => screen.getByRole('button', { name: 'inside' }).focus())
    expect(panel()).toHaveAttribute('data-engaged', 'true')
  })

  it('disengages when focus leaves the panel', () => {
    render(<Harness />)
    act(() => screen.getByRole('button', { name: 'inside' }).focus())
    act(() => screen.getByRole('button', { name: 'outside' }).focus())
    expect(panel()).toHaveAttribute('data-engaged', 'false')
  })

  it('tracks hover', () => {
    render(<Harness />)
    fireEvent.pointerEnter(panel())
    expect(panel()).toHaveAttribute('data-hovered', 'true')
    fireEvent.pointerLeave(panel())
    expect(panel()).toHaveAttribute('data-hovered', 'false')
  })
})

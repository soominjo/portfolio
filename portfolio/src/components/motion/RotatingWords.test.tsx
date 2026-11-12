import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reducedMotion } from '../../test/controls'
import { RotatingWords } from './RotatingWords'

const WORDS = ['Full-Stack', 'Generative AI', 'QA Mindset'] as const

// The word that is on screen, ignoring any word still animating out.
function current(): HTMLElement {
  const present = screen
    .getAllByTestId('rotating-word')
    .find((element) => element.dataset.present === 'true')
  if (!present) throw new Error('no present rotating word')
  return present
}

describe('RotatingWords', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the first word initially', () => {
    render(<RotatingWords words={WORDS} />)
    expect(current()).toHaveTextContent('Full-Stack')
  })

  it('advances to the next word after the interval', () => {
    render(<RotatingWords words={WORDS} />)
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(current()).toHaveTextContent('Generative AI')
  })

  it('wraps back to the first word after the last one', () => {
    render(<RotatingWords words={WORDS} />)
    act(() => {
      vi.advanceTimersByTime(15000)
    })
    expect(current()).toHaveTextContent('Full-Stack')
  })

  it('honours a custom interval', () => {
    render(<RotatingWords words={WORDS} intervalMs={1000} />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(current()).toHaveTextContent('Generative AI')
  })

  it('keeps the first word when reduced motion is preferred', () => {
    reducedMotion.value = true
    render(<RotatingWords words={WORDS} />)
    // One interval, not three: three would cycle a rotating version back to the start.
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getAllByTestId('rotating-word')).toHaveLength(1)
    expect(current()).toHaveTextContent('Full-Stack')
  })

  it('aligns each word to the start of its line', () => {
    render(<RotatingWords words={WORDS} />)
    expect(current()).toHaveClass('justify-self-start')
  })

  it('lists every word for assistive tech', () => {
    render(<RotatingWords words={WORDS} />)
    expect(screen.getByText('Full-Stack, Generative AI, and QA Mindset')).toHaveClass('sr-only')
  })
})

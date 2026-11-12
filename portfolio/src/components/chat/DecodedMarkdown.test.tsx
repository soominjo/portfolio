import { act, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { reducedMotion } from '../../test/controls'
import { GLYPHS } from '../motion/decoder'
import { DecodedMarkdown } from './DecodedMarkdown'

describe('DecodedMarkdown', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the reply directly when it is not decoding', () => {
    render(<DecodedMarkdown markdown="**Maneho.ai** ships" decode={false} />)
    expect(screen.getByText('Maneho.ai').tagName).toBe('STRONG')
    expect(screen.queryByTestId('reply-decoding')).toBeNull()
    expect(screen.getByTestId('reply-final')).not.toHaveClass('sr-only')
  })

  it('keeps the full reply for screen readers while it decodes', () => {
    render(<DecodedMarkdown markdown="Full-stack apps" decode />)
    expect(screen.getByTestId('reply-final')).toHaveClass('sr-only')
    expect(screen.getByTestId('reply-final')).toHaveTextContent('Full-stack apps')
    expect(screen.getByTestId('reply-decoding')).toHaveAttribute('aria-hidden', 'true')
  })

  it('reserves the final layout while decoding', () => {
    render(<DecodedMarkdown markdown={'- one\n- two\n- three'} decode />)
    expect(screen.getByTestId('reply-decoding').querySelectorAll('li')).toHaveLength(3)
  })

  it('scrambles with the hero glyphs', async () => {
    render(<DecodedMarkdown markdown="Full-stack apps with an AI edge" decode />)
    await waitFor(() => {
      const glyphs =
        screen.getByTestId('reply-decoding').querySelector('[data-decode-glyphs]')?.textContent ?? ''
      expect(glyphs.trim().length).toBeGreaterThan(0)
      expect([...glyphs].every((c) => /\s/.test(c) || GLYPHS.includes(c))).toBe(true)
    })
  })

  it('finishes a long reply within two seconds and reports done once', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout'] })
    const onDone = vi.fn()
    const long = Array.from({ length: 40 }, (_, i) => `- **Point ${i}**: a fairly long line about the work`).join(
      '\n',
    )
    render(<DecodedMarkdown markdown={long} decode onDone={onDone} />)
    act(() => {
      vi.advanceTimersByTime(2100)
    })
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('reply-decoding')).toBeNull()
    expect(screen.getByTestId('reply-final')).not.toHaveClass('sr-only')
  })

  it('shows the reply at once under reduced motion', () => {
    reducedMotion.value = true
    const onDone = vi.fn()
    render(<DecodedMarkdown markdown="Hello" decode onDone={onDone} />)
    expect(screen.queryByTestId('reply-decoding')).toBeNull()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('never renders HTML from a reply', () => {
    const { container } = render(
      <DecodedMarkdown markdown={'Use <b>bold</b> <script>alert(1)</script>'} decode={false} />,
    )
    expect(container.querySelector('b, script')).toBeNull()
  })
})

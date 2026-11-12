import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { reducedMotion } from '../../test/controls'
import { DecoderText } from './DecoderText'

describe('DecoderText', () => {
  it('gives assistive tech the real text only', () => {
    render(
      <h1>
        <DecoderText text="Genessis" />
      </h1>,
    )
    expect(screen.getByRole('heading', { name: 'Genessis' })).toBeInTheDocument()
  })

  it('reserves the final text width with an invisible sizer', () => {
    render(<DecoderText text="Genessis" />)
    const sizer = screen.getByTestId('decoder-sizer')
    expect(sizer).toHaveTextContent('Genessis')
    expect(sizer).toHaveClass('invisible')
    expect(sizer).toHaveAttribute('aria-hidden', 'true')
  })

  it('anchors the scramble at the start so settled letters stay put', () => {
    render(<DecoderText text="Genessis" />)
    expect(screen.getByTestId('decoder-output')).toHaveClass('justify-start')
  })

  it('draws the scrambled characters in the code font', async () => {
    render(<DecoderText text="Genessis" />)
    await waitFor(() =>
      expect(screen.getByTestId('decoder-output').querySelector('.font-mono-label')).not.toBeNull(),
    )
  })

  it('starts empty until the delay elapses', () => {
    render(<DecoderText text="Genessis" delayMs={5000} />)
    expect(screen.getByTestId('decoder-output')).toBeEmptyDOMElement()
  })

  it('decodes into the final text after the delay', async () => {
    render(<DecoderText text="Genessis" delayMs={50} />)
    await waitFor(
      () => expect(screen.getByTestId('decoder-output')).toHaveTextContent('Genessis'),
      { timeout: 4000 },
    )
  })

  it('finishes well ahead of the default with a stiffer spring', async () => {
    // Raced side by side on framer's shared clock, so a busy machine slows both
    // alike: the stiff spring settles in about 0.1 s, the default in about 1 s.
    render(
      <>
        <DecoderText text="React" spring={{ stiffness: 600, damping: 50 }} />
        <DecoderText text="React" />
      </>,
    )
    const [fast, slow] = screen.getAllByTestId('decoder-output')

    await waitFor(() => expect(fast).toHaveTextContent('React'), { timeout: 3000 })
    expect(slow).not.toHaveTextContent('React')
  })

  it('shows the final text at once when reduced motion is preferred', () => {
    reducedMotion.value = true
    render(<DecoderText text="Genessis" delayMs={5000} />)
    expect(screen.getByTestId('decoder-output')).toHaveTextContent('Genessis')
  })
})

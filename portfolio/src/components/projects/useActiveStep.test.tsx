import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { intersection } from '../../test/controls'
import { nextActiveStep, useActiveStep } from './useActiveStep'

const STEP_IDS = ['step-a', 'step-b', 'step-c'] as const

function Harness() {
  const active = useActiveStep(STEP_IDS)
  return (
    <>
      {STEP_IDS.map((id) => (
        <div key={id} id={id} />
      ))}
      <p data-testid="active">{active}</p>
    </>
  )
}

describe('nextActiveStep', () => {
  it('picks the latest crossing step', () => {
    expect(nextActiveStep(0, new Set([1, 3]))).toBe(3)
  })

  it('keeps the previous step when none cross', () => {
    expect(nextActiveStep(2, new Set())).toBe(2)
  })
})

describe('useActiveStep', () => {
  it('starts on the first step', async () => {
    render(<Harness />)
    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('0'))
  })

  it('follows the step crossing the middle of the viewport', async () => {
    intersection.byId = { 'step-c': true }
    render(<Harness />)
    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('2'))
  })

  it('prefers the later step when two cross', async () => {
    intersection.byId = { 'step-b': true, 'step-c': true }
    render(<Harness />)
    await waitFor(() => expect(screen.getByTestId('active')).toHaveTextContent('2'))
  })
})

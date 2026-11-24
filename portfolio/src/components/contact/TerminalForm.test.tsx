import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MotionGlobalConfig } from 'framer-motion'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { TerminalForm } from './TerminalForm'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

const fetchMock = vi.fn<typeof fetch>()
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const fill = ({ name = 'Jane Smith', email = 'jane@company.com', message = 'I would love to chat about a role.' } = {}) => {
  fireEvent.change(screen.getByLabelText('name'), { target: { value: name } })
  fireEvent.change(screen.getByLabelText('email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('message'), { target: { value: message } })
}
const keycap = () => screen.getByRole('button', { name: /send message|sending/i })
const status = () => screen.getByTestId('terminal-status')

async function sendOk(): Promise<void> {
  fetchMock.mockResolvedValue(json(200, { success: true }))
  fill()
  fireEvent.click(keycap())
  await screen.findByTestId('terminal-sent')
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true
})
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false
})
beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('TerminalForm', () => {
  it('labels the three fields', () => {
    render(<TerminalForm onBack={vi.fn()} />)
    const name = screen.getByLabelText('name')
    expect(name).toHaveAttribute('autocomplete', 'name')
    expect(name).toHaveAttribute('maxLength', '100')
    const email = screen.getByLabelText('email')
    expect(email).toHaveAttribute('type', 'email')
    expect(email).toHaveAttribute('maxLength', '254')
    const message = screen.getByLabelText('message')
    expect(message.tagName).toBe('TEXTAREA')
    expect(message).toHaveAttribute('maxLength', '2000')
  })

  it('shows ONLINE, then INPUT while a field has focus, then SENDING', async () => {
    fetchMock.mockReturnValue(new Promise<Response>(() => {}))
    render(<TerminalForm onBack={vi.fn()} />)
    expect(status()).toHaveTextContent('ONLINE')

    fireEvent.focus(screen.getByLabelText('name'))
    expect(status()).toHaveTextContent('INPUT')
    expect(status()).toHaveAttribute('data-status', 'input')

    fill()
    fireEvent.click(keycap())
    await waitFor(() => expect(status()).toHaveTextContent('SENDING'))
    expect(status()).toHaveAttribute('data-status', 'processing')
    expect(keycap()).toHaveTextContent('SENDING…')
    expect(keycap()).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Sending your message…')
  })

  // The spec: INPUT "while any field has focus". The keycap and the sent log aren't fields.
  it('shows INPUT only while a field has focus', async () => {
    render(<TerminalForm onBack={vi.fn()} />)
    const name = screen.getByLabelText('name')
    fireEvent.focus(name)
    expect(status()).toHaveTextContent('INPUT')

    fireEvent.blur(name, { relatedTarget: keycap() })
    fireEvent.focus(keycap())
    expect(status()).toHaveTextContent('ONLINE')

    await sendOk()
    await waitFor(() => expect(screen.getByTestId('terminal-sent')).toHaveFocus())
    expect(status()).toHaveTextContent('ONLINE')
  })

  it('flags empty fields without sending', async () => {
    render(<TerminalForm onBack={vi.fn()} />)
    fireEvent.click(keycap())

    const alerts = await screen.findAllByRole('alert')
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      '✗ Name must be at least 2 characters',
      '✗ Please enter a valid email address',
      '✗ Message must be at least 10 characters',
    ])
    expect(screen.getByLabelText('name')).toHaveAttribute('aria-invalid', 'true')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends with Ctrl+Enter or ⌘+Enter from the message', async () => {
    fetchMock.mockReturnValue(new Promise<Response>(() => {}))
    const { unmount } = render(<TerminalForm onBack={vi.fn()} />)
    fill()
    fireEvent.keyDown(screen.getByLabelText('message'), { key: 'Enter', ctrlKey: true })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    unmount()

    render(<TerminalForm onBack={vi.fn()} />)
    fill()
    fireEvent.keyDown(screen.getByLabelText('message'), { key: 'Enter', metaKey: true })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
  })

  it('keeps a plain Enter in the message as a new line', async () => {
    render(<TerminalForm onBack={vi.fn()} />)
    fill()
    fireEvent.keyDown(screen.getByLabelText('message'), { key: 'Enter' })
    await act(async () => {})
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends a native submit once, through the checks', async () => {
    fetchMock.mockReturnValue(new Promise<Response>(() => {}))
    render(<TerminalForm onBack={vi.fn()} />)
    fill()
    const form = screen.getByLabelText('email').closest('form') as HTMLFormElement
    fireEvent.submit(form)
    fireEvent.submit(form)
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    await act(async () => {})
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('shows a failed send as a ✗ line and keeps the text', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }))
    render(<TerminalForm onBack={vi.fn()} />)
    fill()
    fireEvent.click(keycap())

    expect(await screen.findByText('✗ Something went wrong. Please try again in a moment.')).toBeInTheDocument()
    expect(screen.getByLabelText('email')).toHaveValue('jane@company.com')
  })

  it('shows the delivered log, focused, with no promise of a confirmation email', async () => {
    render(<TerminalForm onBack={vi.fn()} />)
    await sendOk()

    const log = screen.getByTestId('terminal-sent')
    expect(log).toHaveTextContent('> sending message… done')
    expect(log).toHaveTextContent('✓ delivered')
    expect(log).toHaveTextContent("> I'll reply within 24 hours.")
    expect(log).not.toHaveTextContent(/confirmation/i)
    await waitFor(() => expect(log).toHaveFocus())
  })

  it('starts an empty message after ↺ New message', async () => {
    render(<TerminalForm onBack={vi.fn()} />)
    await sendOk()

    fireEvent.click(screen.getByRole('button', { name: '↺ New message' }))
    const name = await screen.findByLabelText('name')
    expect(name).toHaveValue('')
    await waitFor(() => expect(name).toHaveFocus())
  })

  it('goes back from ← Portfolio', async () => {
    const onBack = vi.fn()
    render(<TerminalForm onBack={onBack} />)
    await sendOk()

    fireEvent.click(screen.getByRole('button', { name: '← Portfolio' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('throws nothing when it leaves mid-send', async () => {
    const errors = vi.spyOn(console, 'error')
    let finish: (response: Response) => void = () => {}
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => (finish = resolve)))
    const { unmount } = render(<TerminalForm onBack={vi.fn()} />)
    fill()
    fireEvent.click(keycap())
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    unmount()
    await act(async () => finish(json(200, { success: true })))
    expect(errors).not.toHaveBeenCalled()
  })
})

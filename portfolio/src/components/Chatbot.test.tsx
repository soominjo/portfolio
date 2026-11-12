import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reducedMotion } from '../test/controls'
import { Chatbot } from './Chatbot'

// The orb is decorative and needs WebGL; its own tests cover it.
vi.mock('./three/ChatOrb', () => ({ default: () => null }))

const replyWith = (reply: string) => ({ json: async () => ({ success: true, reply }) }) as Response

async function openChat() {
  fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
  return screen.findByRole('dialog', { name: 'Ask about Genessis' })
}

function ask(question: string) {
  fireEvent.change(screen.getByRole('textbox', { name: 'Message' }), { target: { value: question } })
  fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
}

async function closeWithOrb() {
  fireEvent.click(screen.getByRole('button', { name: 'Close chat', expanded: true }))
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
}

describe('Chatbot', () => {
  beforeEach(() => {
    // Replies render without decoding, so tests can read them straight away.
    reducedMotion.value = true
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts closed, and the orb opens the terminal', async () => {
    render(<Chatbot />)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
    expect(await screen.findByRole('dialog', { name: 'Ask about Genessis' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close chat', expanded: true })).toBeInTheDocument()
  })

  it('sends a question and shows the reply', async () => {
    vi.mocked(fetch).mockResolvedValue(replyWith('Mostly **React**.'))
    render(<Chatbot />)
    await openChat()
    ask('What stack?')
    expect((await screen.findByText('React')).tagName).toBe('STRONG')
    const [, init] = vi.mocked(fetch).mock.calls[0]
    expect(JSON.parse(init?.body as string)).toMatchObject({ message: 'What stack?' })
  })

  it('keeps the conversation after closing and reopening', async () => {
    vi.mocked(fetch).mockResolvedValue(replyWith('Kept reply'))
    render(<Chatbot />)
    await openChat()
    ask('Hi')
    await screen.findByText('Kept reply')
    await closeWithOrb()
    await openChat()
    expect(within(screen.getByRole('log')).getByText('Kept reply')).toBeInTheDocument()
  })

  it.each(['Escape', '[×]'])('returns focus to the orb when closed with %s', async (how) => {
    render(<Chatbot />)
    const dialog = await openChat()
    if (how === 'Escape') {
      fireEvent.keyDown(dialog, { key: 'Escape' })
    } else {
      fireEvent.click(within(dialog).getByRole('button', { name: 'Close chat' }))
    }
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByRole('button', { name: 'Open chat' })).toHaveFocus()
  })

  it('keeps a reply that arrives while the chat is closed', async () => {
    let resolve!: (response: Response) => void
    vi.mocked(fetch).mockReturnValue(
      new Promise<Response>((r) => {
        resolve = r
      }),
    )
    render(<Chatbot />)
    await openChat()
    ask('Hi')
    await closeWithOrb()
    await act(async () => resolve(replyWith('Late reply')))
    await openChat()
    expect(await screen.findByText('Late reply')).toBeInTheDocument()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('shows the network error when the request fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('offline'))
    render(<Chatbot />)
    await openChat()
    ask('Hi')
    expect(await screen.findByText('Network error. Please try again.')).toBeInTheDocument()
  })

  it('caps the terminal height to the screen', () => {
    render(<Chatbot />)
    expect(screen.getByTestId('chat-stage')).toHaveClass('h-[min(476px,calc(100dvh-13rem))]')
  })
})

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { WELCOME_MESSAGE } from './chatApi'
import { ChatTerminal } from './ChatTerminal'
import { SUGGESTIONS, type ChatController } from './useChat'

function fakeChat(overrides: Partial<ChatController> = {}): ChatController {
  return {
    messages: [WELCOME_MESSAGE],
    waiting: false,
    suggestions: [...SUGGESTIONS],
    draft: '',
    setDraft: vi.fn(),
    submitDraft: vi.fn(),
    askSuggestion: vi.fn(),
    markDecoded: vi.fn(),
    ...overrides,
  }
}

const renderTerminal = (chat = fakeChat(), onClose = vi.fn()) =>
  render(
    <>
      <ChatTerminal id="chat-terminal" chat={chat} onClose={onClose} />
      <button type="button">outside</button>
    </>,
  )

const messageInput = () => screen.getByRole('textbox', { name: 'Message' })

describe('ChatTerminal', () => {
  it('is a dialog named after the assistant, with the terminal prompt', () => {
    renderTerminal()
    expect(screen.getByRole('dialog', { name: 'Ask about Genessis' })).toBeInTheDocument()
    expect(screen.getByText('ask_genessis')).toBeInTheDocument()
  })

  it.each([
    [{}, 'ONLINE'],
    [{ draft: 'hi' }, 'INPUT'],
    [{ waiting: true }, 'PROCESSING'],
  ])('shows %j as %s', (overrides, label) => {
    renderTerminal(fakeChat(overrides))
    expect(screen.getByTestId('chat-status')).toHaveTextContent(label)
  })

  it('labels who said what in a polite live log', () => {
    renderTerminal(
      fakeChat({ messages: [WELCOME_MESSAGE, { id: 'u1', role: 'user', content: 'Hi', decode: false }] }),
    )
    const log = screen.getByRole('log')
    expect(log).toHaveAttribute('aria-live', 'polite')
    expect(within(log).getByText('GENS.AI ›')).toBeInTheDocument()
    expect(within(log).getByText('YOU ›')).toBeInTheDocument()
  })

  it('shows the processing row while waiting', () => {
    renderTerminal(fakeChat({ waiting: true }))
    expect(within(screen.getByRole('log')).getByText('Waiting for a reply')).toBeInTheDocument()
  })

  it('turns suggestions into keys that lock while waiting', () => {
    const chat = fakeChat()
    const { unmount } = renderTerminal(chat)
    fireEvent.click(screen.getByRole('button', { name: 'AI experience?' }))
    expect(chat.askSuggestion).toHaveBeenCalledWith('AI experience?')
    unmount()
    renderTerminal(fakeChat({ waiting: true }))
    expect(screen.getByRole('button', { name: 'AI experience?' })).toBeDisabled()
  })

  it('passes typing to the controller and sends only when there is something to send', () => {
    const empty = fakeChat()
    const first = renderTerminal(empty)
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    fireEvent.change(messageInput(), { target: { value: 'hello' } })
    expect(empty.setDraft).toHaveBeenCalledWith('hello')
    first.unmount()

    const ready = fakeChat({ draft: 'hi' })
    const second = renderTerminal(ready)
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(ready.submitDraft).toHaveBeenCalledTimes(1)
    second.unmount()

    renderTerminal(fakeChat({ draft: 'hi', waiting: true }))
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
  })

  it('closes from [×] and from Escape', () => {
    const onClose = vi.fn()
    renderTerminal(fakeChat(), onClose)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close chat' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('lands at rest with the cursor already in the input', async () => {
    renderTerminal()
    await waitFor(() => expect(messageInput()).toHaveFocus())
    expect(screen.getByRole('dialog')).toHaveAttribute('data-pose', 'rest')
  })

  it('turns toward the pointer, and faces the visitor once they type', () => {
    renderTerminal()
    const dialog = screen.getByRole('dialog')
    fireEvent.pointerEnter(dialog)
    expect(dialog).toHaveAttribute('data-pose', 'hover')
    fireEvent.keyDown(messageInput(), { key: 'a' })
    expect(dialog).toHaveAttribute('data-pose', 'engaged')
  })

  it('returns to rest when focus leaves the terminal', () => {
    renderTerminal()
    const dialog = screen.getByRole('dialog')
    // A visitor types into a focused input, so focus is inside before it leaves.
    act(() => messageInput().focus())
    fireEvent.keyDown(messageInput(), { key: 'a' })
    expect(dialog).toHaveAttribute('data-pose', 'engaged')
    act(() => screen.getByRole('button', { name: 'outside' }).focus())
    fireEvent.pointerLeave(dialog)
    expect(dialog).toHaveAttribute('data-pose', 'rest')
  })

  it('keeps focus inside when the visitor clicks its text', () => {
    renderTerminal()
    // Focusable itself, so a click on plain text moves focus to the panel, not out of it.
    expect(screen.getByRole('dialog')).toHaveAttribute('tabindex', '-1')
  })
})

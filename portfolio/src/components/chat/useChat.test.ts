import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, type Mock } from 'vitest'
import { WELCOME_MESSAGE } from './chatApi'
import { getChatStatus, useChat } from './useChat'

// Answers each request with the next reply, immediately.
function replyingWith(...replies: string[]): Mock {
  const queue = [...replies]
  return vi.fn(async () => ({ json: async () => ({ success: true, reply: queue.shift() ?? 'Reply' }) }))
}

// A request that never answers, so the hook stays waiting.
const neverReplying = (): Mock => vi.fn(() => new Promise(() => {}))

function bodyOf(fetchImpl: Mock, call: number): { message: string; messages: unknown[] } {
  return JSON.parse(fetchImpl.mock.calls[call][1].body as string)
}

const asFetch = (mock: Mock) => mock as unknown as typeof fetch

describe('getChatStatus', () => {
  it.each([
    [false, '', 'online'],
    [false, '   ', 'online'],
    [false, 'hi', 'input'],
    [true, 'hi', 'processing'],
    [true, '', 'processing'],
  ] as const)('getChatStatus(%s, %j) is %s', (waiting, draft, status) => {
    expect(getChatStatus(waiting, draft)).toBe(status)
  })
})

describe('useChat', () => {
  it('opens with the welcome message and the three suggestions', () => {
    const { result } = renderHook(() => useChat(asFetch(vi.fn())))
    expect(result.current.messages).toEqual([WELCOME_MESSAGE])
    expect(result.current.suggestions).toEqual(['What does Gens build?', 'AI experience?', 'Open to work?'])
  })

  it('sends the trimmed draft, waits, then adds the reply to decode', async () => {
    let resolve!: (body: unknown) => void
    const fetchImpl = vi.fn(
      () =>
        new Promise((r) => {
          resolve = (body) => r({ json: async () => body })
        }),
    )
    const { result } = renderHook(() => useChat(asFetch(fetchImpl)))
    act(() => result.current.setDraft('  What stack?  '))
    act(() => result.current.submitDraft())
    expect(result.current.draft).toBe('')
    expect(result.current.waiting).toBe(true)
    expect(result.current.messages.at(-1)).toMatchObject({ role: 'user', content: 'What stack?', decode: false })
    await act(async () => resolve({ success: true, reply: 'React and Node.' }))
    expect(result.current.waiting).toBe(false)
    expect(result.current.messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: 'React and Node.',
      decode: true,
    })
  })

  it('ignores blank drafts and anything sent while waiting', () => {
    const fetchImpl = neverReplying()
    const { result } = renderHook(() => useChat(asFetch(fetchImpl)))
    act(() => result.current.setDraft('   '))
    act(() => result.current.submitDraft())
    expect(fetchImpl).not.toHaveBeenCalled()

    act(() => result.current.setDraft('a'))
    act(() => result.current.submitDraft())
    act(() => result.current.setDraft('b'))
    act(() => result.current.submitDraft())
    act(() => result.current.askSuggestion('AI experience?'))
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(result.current.suggestions).toContain('AI experience?')
  })

  it('sends a suggestion once and removes it', async () => {
    const fetchImpl = replyingWith('Built RAG pipelines.')
    const { result } = renderHook(() => useChat(asFetch(fetchImpl)))
    await act(async () => result.current.askSuggestion('AI experience?'))
    expect(result.current.suggestions).toEqual(['What does Gens build?', 'Open to work?'])
    expect(result.current.messages.filter((m) => m.role === 'user').at(-1)?.content).toBe('AI experience?')
    expect(bodyOf(fetchImpl, 0).message).toBe('AI experience?')
  })

  it('sends earlier turns as history, without the welcome', async () => {
    const fetchImpl = replyingWith('Reply 1', 'Reply 2')
    const { result } = renderHook(() => useChat(asFetch(fetchImpl)))
    act(() => result.current.setDraft('First'))
    await act(async () => result.current.submitDraft())
    act(() => result.current.setDraft('Second'))
    await act(async () => result.current.submitDraft())
    expect(bodyOf(fetchImpl, 0).messages).toEqual([])
    expect(bodyOf(fetchImpl, 1).messages).toEqual([
      { role: 'user', content: 'First' },
      { role: 'model', content: 'Reply 1' },
    ])
  })

  it('stops decoding a reply once it has been shown', async () => {
    const fetchImpl = replyingWith('Hello there')
    const { result } = renderHook(() => useChat(asFetch(fetchImpl)))
    act(() => result.current.setDraft('Hi'))
    await act(async () => result.current.submitDraft())
    const reply = result.current.messages.at(-1)!
    expect(reply.decode).toBe(true)
    act(() => result.current.markDecoded(reply.id))
    expect(result.current.messages.at(-1)?.decode).toBe(false)
  })
})

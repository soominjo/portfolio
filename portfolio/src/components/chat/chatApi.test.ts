import { describe, expect, it, vi } from 'vitest'
import { NETWORK_ERROR, WELCOME_MESSAGE, requestReply, toHistory } from './chatApi'

const replying = (body: unknown) => vi.fn().mockResolvedValue({ json: () => Promise.resolve(body) })

describe('chat API', () => {
  it('keeps the welcome copy word for word', () => {
    expect(WELCOME_MESSAGE.content).toBe(
      "Hi! I'm Gens' AI assistant. Ask me anything about his experience, skills, or projects — I'm here to help!",
    )
  })

  it('drops the welcome message and maps roles for the API', () => {
    expect(
      toHistory([
        WELCOME_MESSAGE,
        { id: 'u1', role: 'user', content: 'Hi', decode: false },
        { id: 'a1', role: 'assistant', content: 'Hello', decode: false },
      ]),
    ).toEqual([
      { role: 'user', content: 'Hi' },
      { role: 'model', content: 'Hello' },
    ])
  })

  it('posts the message and history as JSON to /api/chat', async () => {
    const fetchImpl = replying({ success: true, reply: 'Hello' })
    await requestReply('Hi', [{ role: 'user', content: 'Earlier' }], fetchImpl)
    expect(fetchImpl).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hi', messages: [{ role: 'user', content: 'Earlier' }] }),
    })
  })

  it('returns the reply on success', async () => {
    expect(await requestReply('Hi', [], replying({ success: true, reply: 'Hello' }))).toBe('Hello')
  })

  it('shows the API error', async () => {
    expect(await requestReply('Hi', [], replying({ success: false, error: 'Rate limited' }))).toBe(
      'Error: Rate limited',
    )
  })

  it.each([{ success: false }, { success: true }, null, 'oops'])('falls back to Unknown error for %j', async (body) => {
    expect(await requestReply('Hi', [], replying(body))).toBe('Error: Unknown error')
  })

  it('shows the network error when fetch rejects', async () => {
    expect(await requestReply('Hi', [], vi.fn().mockRejectedValue(new TypeError('offline')))).toBe(NETWORK_ERROR)
  })

  it('shows the network error when the body is not JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ json: () => Promise.reject(new SyntaxError('bad')) })
    expect(await requestReply('Hi', [], fetchImpl)).toBe(NETWORK_ERROR)
  })
})

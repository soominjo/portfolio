import { act, renderHook } from '@testing-library/react'
import confetti from 'canvas-confetti'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FALLBACK_ERROR, useContactSubmit } from './useContactSubmit'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

const fetchMock = vi.fn<typeof fetch>()
const data = { name: 'Jane Smith', email: 'jane@company.com', message: 'I would love to chat about a role.' }
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  fetchMock.mockReset()
  vi.mocked(confetti).mockClear()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('useContactSubmit', () => {
  it('posts the message as JSON to /api/contact', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(data) }),
    )
    expect(result.current.state).toEqual({ kind: 'sent' })
  })

  it('sends once while a send is in flight', async () => {
    let finish: (r: Response) => void = () => {}
    fetchMock.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const { result } = renderHook(() => useContactSubmit())
    act(() => {
      void result.current.send(data, null)
      void result.current.send(data, null)
    })
    expect(result.current.state).toEqual({ kind: 'sending' })
    await act(async () => finish(json(200, { success: true })))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('stays locked after a send', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    await act(() => result.current.send(data, null))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("shows the server's error and unlocks", async () => {
    fetchMock.mockResolvedValue(json(429, { error: 'Too many requests. Please try again later.' }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    expect(result.current.state).toEqual({ kind: 'error', message: 'Too many requests. Please try again later.' })
    await act(() => result.current.send(data, null))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falls back when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    expect(result.current.state).toEqual({ kind: 'error', message: FALLBACK_ERROR })
  })

  it('falls back when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    expect(result.current.state).toEqual({ kind: 'error', message: FALLBACK_ERROR })
  })

  it('fires confetti from the origin, respecting reduced motion', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const origin = document.body.appendChild(document.createElement('button'))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, origin))
    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ disableForReducedMotion: true, colors: ['#6366f1', '#818cf8', '#22d3ee'] }),
    )
    origin.remove()
  })

  it('skips confetti when the origin has left the page', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, document.createElement('button')))
    expect(confetti).not.toHaveBeenCalled()
  })

  it('reset returns to idle and unlocks', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    act(() => result.current.reset())
    expect(result.current.state).toEqual({ kind: 'idle' })
    await act(() => result.current.send(data, null))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})

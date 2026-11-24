import confetti from 'canvas-confetti'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ContactFormData } from './contactSchema'

export type SendState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'sending' }
  | { readonly kind: 'sent' }
  | { readonly kind: 'error'; readonly message: string }

export interface ContactSubmit {
  readonly state: SendState
  /** Sends the message. `origin` is where the confetti bursts from. */
  readonly send: (data: ContactFormData, origin: HTMLElement | null) => Promise<void>
  /** Back to an empty, unlocked form. */
  readonly reset: () => void
}

export const FALLBACK_ERROR = 'Something went wrong. Please try again in a moment.'

const IDLE: SendState = { kind: 'idle' }
const SENDING: SendState = { kind: 'sending' }
const SENT: SendState = { kind: 'sent' }

function fireConfetti(origin: HTMLElement): void {
  const rect = origin.getBoundingClientRect()
  void confetti({
    particleCount: 40,
    spread: 55,
    startVelocity: 22,
    gravity: 1.1,
    scalar: 0.7,
    ticks: 150,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: rect.top / window.innerHeight,
    },
    colors: ['#6366f1', '#818cf8', '#22d3ee'],
    disableForReducedMotion: true,
  })
}

async function readServerError(response: Response): Promise<string> {
  const body: unknown = await response.json().catch(() => null)
  if (body !== null && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    return body.error
  }
  return FALLBACK_ERROR
}

/**
 * Sends the contact form to /api/contact. A lock stops a second send from any
 * source; it releases on an error, and stays on after a success until reset().
 */
export function useContactSubmit(): ContactSubmit {
  const [state, setState] = useState<SendState>(IDLE)
  const locked = useRef(false)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const update = useCallback((next: SendState): void => {
    if (mounted.current) setState(next)
  }, [])

  const send = useCallback(
    async (data: ContactFormData, origin: HTMLElement | null): Promise<void> => {
      if (locked.current) return
      locked.current = true
      update(SENDING)

      const fail = (message: string): void => {
        locked.current = false
        update({ kind: 'error', message })
      }

      let response: Response
      try {
        response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
      } catch {
        fail(FALLBACK_ERROR)
        return
      }
      if (!response.ok) {
        fail(await readServerError(response))
        return
      }

      // A keycap that has left the page (the visitor went Back mid-send) has no position to burst from.
      if (origin?.isConnected) fireConfetti(origin)
      update(SENT)
    },
    [update],
  )

  const reset = useCallback((): void => {
    locked.current = false
    update(IDLE)
  }, [update])

  return { state, send, reset }
}

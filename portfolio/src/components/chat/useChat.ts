import { useRef, useState } from 'react'
import { requestReply, toHistory, WELCOME_MESSAGE, type ChatMessage } from './chatApi'

/** Questions offered as keys above the input, in this order. */
export const SUGGESTIONS: readonly string[] = ['What does Gens build?', 'AI experience?', 'Open to work?']

export type ChatStatus = 'online' | 'input' | 'processing'

export const STATUS_LABELS: Readonly<Record<ChatStatus, string>> = {
  online: 'ONLINE',
  input: 'INPUT',
  processing: 'PROCESSING',
}

export function getChatStatus(waiting: boolean, draft: string): ChatStatus {
  if (waiting) return 'processing'
  return draft.trim() ? 'input' : 'online'
}

export interface ChatController {
  readonly messages: readonly ChatMessage[]
  readonly waiting: boolean
  readonly suggestions: readonly string[]
  readonly draft: string
  setDraft(value: string): void
  submitDraft(): void
  askSuggestion(text: string): void
  markDecoded(id: string): void
}

/** The conversation with Gens' assistant: messages, the draft, suggestions and the request in flight. */
export function useChat(fetchImpl?: typeof fetch): ChatController {
  const [messages, setMessages] = useState<readonly ChatMessage[]>([WELCOME_MESSAGE])
  const [waiting, setWaiting] = useState(false)
  const [suggestions, setSuggestions] = useState<readonly string[]>(SUGGESTIONS)
  const [draft, setDraft] = useState('')
  // Guards against a second send landing before React re-renders with `waiting`.
  const inFlightRef = useRef(false)
  const idRef = useRef(0)

  const nextId = (): string => {
    idRef.current += 1
    return `msg-${idRef.current}`
  }

  const send = (text: string): boolean => {
    const content = text.trim()
    if (!content || inFlightRef.current) return false

    inFlightRef.current = true
    const history = toHistory(messages)
    const question: ChatMessage = { id: nextId(), role: 'user', content, decode: false }
    setMessages((previous) => [...previous, question])
    setWaiting(true)

    void requestReply(content, history, fetchImpl).then((reply) => {
      const answer: ChatMessage = { id: nextId(), role: 'assistant', content: reply, decode: true }
      setMessages((previous) => [...previous, answer])
      setWaiting(false)
      inFlightRef.current = false
    })
    return true
  }

  return {
    messages,
    waiting,
    suggestions,
    draft,
    setDraft,
    submitDraft() {
      if (send(draft)) setDraft('')
    },
    askSuggestion(text) {
      if (inFlightRef.current) return
      setSuggestions((previous) => previous.filter((suggestion) => suggestion !== text))
      send(text)
    },
    markDecoded(id) {
      setMessages((previous) =>
        previous.map((message) => (message.id === id && message.decode ? { ...message, decode: false } : message)),
      )
    },
  }
}

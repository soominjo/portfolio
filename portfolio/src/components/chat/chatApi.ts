export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  readonly id: string
  readonly role: ChatRole
  readonly content: string
  /** True while a fresh assistant reply should decode in. */
  readonly decode: boolean
}

/** One earlier turn, in the shape /api/chat expects. */
export interface HistoryItem {
  readonly role: 'user' | 'model'
  readonly content: string
}

export const WELCOME_ID = 'welcome'

export const WELCOME_MESSAGE: ChatMessage = {
  id: WELCOME_ID,
  role: 'assistant',
  content: "Hi! I'm Gens' AI assistant. Ask me anything about his experience, skills, or projects — I'm here to help!",
  decode: false,
}

export const NETWORK_ERROR = 'Network error. Please try again.'

const CHAT_ENDPOINT = '/api/chat'
const UNKNOWN_ERROR = 'Unknown error'

// A bare `fetch` reference loses its `this` and throws "Illegal invocation" in Chrome.
const globalFetch: typeof fetch = (input, init) => fetch(input, init)

/** The conversation so far, without the welcome message, in the API's roles. */
export function toHistory(messages: readonly ChatMessage[]): HistoryItem[] {
  return messages
    .filter((message) => message.id !== WELCOME_ID)
    .map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      content: message.content,
    }))
}

function readReply(data: unknown): string {
  if (typeof data !== 'object' || data === null) return `Error: ${UNKNOWN_ERROR}`

  const { success, reply, error } = data as Record<string, unknown>
  if (success === true && typeof reply === 'string') return reply
  return `Error: ${typeof error === 'string' ? error : UNKNOWN_ERROR}`
}

/** Asks the assistant. Never throws: failures come back as text to show in the chat. */
export async function requestReply(
  message: string,
  history: readonly HistoryItem[],
  fetchImpl: typeof fetch = globalFetch,
): Promise<string> {
  try {
    const response = await fetchImpl(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, messages: history }),
    })
    const data: unknown = await response.json()
    return readReply(data)
  } catch {
    return NETWORK_ERROR
  }
}

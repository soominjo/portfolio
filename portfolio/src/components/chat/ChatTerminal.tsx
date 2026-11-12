import { motion, useIsPresent, useReducedMotion } from 'framer-motion'
import { useEffect, useLayoutEffect, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { ProcessingRow, TerminalMessage } from './TerminalMessage'
import { CLOSED_ROTATE_Y, getTerminalAngles, getTerminalPose } from './terminalPose'
import { useCanTilt } from './useCanTilt'
import { getChatStatus, STATUS_LABELS, type ChatController } from './useChat'
import { useEngagement } from './useEngagement'

export interface ChatTerminalProps {
  id: string
  chat: ChatController
  onClose: () => void
}

/** Lets the hinge swing start before the cursor lands in the input. */
export const FOCUS_DELAY_MS = 150

const MESSAGE_MAX_LENGTH = 500
const SWING = { duration: 0.9, ease: [0.22, 1, 0.36, 1] } as const
const FADE = { duration: 0.2 } as const
const CORNERS = ['tl', 'tr', 'bl', 'br'] as const

/**
 * The holo terminal: a HUD panel that swings open on its right-edge hinge,
 * rests tilted toward the page, turns toward the pointer and faces the visitor
 * once they engage. Phones, narrow screens and reduced motion face straight on.
 */
export function ChatTerminal({ id, chat, onClose }: ChatTerminalProps) {
  const reduceMotion = useReducedMotion()
  // False while the close animation plays; the terminal must not take focus then.
  const isPresent = useIsPresent()
  const canTilt = useCanTilt()
  const { engaged, hovered, handlers, focusQuietly } = useEngagement()
  const inputRef = useRef<HTMLInputElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const pose = getTerminalPose(engaged, hovered)
  const angles = getTerminalAngles(pose, canTilt && !reduceMotion)
  const status = getChatStatus(chat.waiting, chat.draft)
  const motionProps = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, ...angles }, exit: { opacity: 0 }, transition: FADE }
    : {
        initial: { opacity: 0, rotateY: CLOSED_ROTATE_Y },
        animate: { opacity: 1, ...angles },
        exit: { opacity: 0, rotateY: CLOSED_ROTATE_Y },
        transition: SWING,
      }

  // Closing within the delay cancels it, so focus stays on the orb it was handed to.
  useEffect(() => {
    if (!isPresent) return
    const timer = window.setTimeout(() => focusQuietly(inputRef.current), FOCUS_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [isPresent, focusQuietly])

  useLayoutEffect(() => {
    const log = logRef.current
    if (log) log.scrollTop = log.scrollHeight
  }, [chat.messages.length, chat.waiting])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose()
      return
    }
    handlers.onKeyDown()
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    chat.submitDraft()
  }

  return (
    <motion.div
      id={id}
      role="dialog"
      aria-modal="false"
      aria-label="Ask about Genessis"
      data-pose={pose}
      tabIndex={-1}
      className="chat-terminal pointer-events-auto absolute inset-0 flex flex-col overflow-hidden rounded-md outline-none"
      style={{ transformOrigin: '100% 50%' }}
      {...motionProps}
      onPointerEnter={handlers.onPointerEnter}
      onPointerLeave={handlers.onPointerLeave}
      onPointerDown={handlers.onPointerDown}
      onFocus={handlers.onFocus}
      onBlur={handlers.onBlur}
      onKeyDown={onKeyDown}
    >
      {CORNERS.map((corner) => (
        <i key={corner} aria-hidden="true" className={`chat-corner chat-corner--${corner}`} />
      ))}
      <div aria-hidden="true" className="chat-scanlines" />

      <div className="chat-head relative z-10 flex items-center gap-2.5 py-3 pr-3 pl-4">
        <p className="font-mono-label text-[13px] font-medium tracking-wide whitespace-nowrap text-slate-200 light:text-slate-900">
          <span aria-hidden="true" className="mr-1.5 text-cyan-400 light:text-cyan-600">
            &gt;
          </span>
          ask_genessis
          <span aria-hidden="true" className="chat-caret" />
        </p>
        <p data-testid="chat-status" data-status={status} className="chat-status ml-auto">
          {STATUS_LABELS[status]}
        </p>
        <button
          type="button"
          aria-label="Close chat"
          onClick={onClose}
          className="rounded-sm px-1 py-1 font-mono-label text-xs text-slate-500 transition-colors hover:text-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 light:hover:text-cyan-600"
        >
          [×]
        </button>
      </div>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="chat-log relative z-10 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4"
      >
        {chat.messages.map((message) => (
          <TerminalMessage key={message.id} message={message} onDecoded={chat.markDecoded} />
        ))}
        {chat.waiting && <ProcessingRow />}
      </div>

      {chat.suggestions.length > 0 && (
        <div className="relative z-10 flex flex-wrap gap-2 px-3.5 pt-1 pb-3.5">
          {chat.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="chat-key"
              disabled={chat.waiting}
              onClick={() => chat.askSuggestion(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="relative z-10 flex items-center gap-2 border-t border-dashed border-cyan-400/25 px-3.5 pt-2.5 pb-4 transition-colors focus-within:border-cyan-400/70 light:border-cyan-600/30 light:focus-within:border-cyan-600/70"
      >
        <span aria-hidden="true" className="font-mono-label text-sm font-medium text-cyan-400 light:text-cyan-600">
          &gt;
        </span>
        <input
          ref={inputRef}
          value={chat.draft}
          onChange={(event) => chat.setDraft(event.target.value)}
          placeholder="type a question…"
          maxLength={MESSAGE_MAX_LENGTH}
          aria-label="Message"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-2 font-mono-label text-[13px] text-slate-200 caret-cyan-400 outline-none placeholder:text-slate-500 light:text-slate-900 light:caret-cyan-600 light:placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="chat-key"
          aria-label="Send message"
          disabled={!chat.draft.trim() || chat.waiting}
        >
          ⏎ Enter
        </button>
      </form>
    </motion.div>
  )
}

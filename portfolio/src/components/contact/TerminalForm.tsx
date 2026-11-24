import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react'
import { useForm } from 'react-hook-form'
import { CONTACT_LIMITS, contactSchema, type ContactFormData } from './contactSchema'
import { PromptRow } from './PromptRow'
import { useContactSubmit } from './useContactSubmit'

interface TerminalFormProps {
  /** Leaves the form page (the sent log's "← Portfolio"). */
  readonly onBack: () => void
}

interface TerminalStatus {
  readonly text: 'ONLINE' | 'INPUT' | 'SENDING'
  readonly key?: 'input' | 'processing'
}

const EMPTY: ContactFormData = { name: '', email: '', message: '' }

// INPUT shows only while a field has focus, not the keycap or the sent log.
function isField(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
}
const IS_APPLE = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)

// .chat-key is unlayered CSS sized for the chat's small keys, so the bigger
// send key needs important utilities to win.
const KEYCAP_CLASS = 'chat-key px-4! pt-2.5! pb-[11px]! text-xs! aria-disabled:opacity-60'

/**
 * The contact form as a sibling of the chat's holo terminal: prompt-style rows,
 * a live status, a keycap send, and a delivered log once the message is sent.
 */
export function TerminalForm({ onBack }: TerminalFormProps) {
  const { state, send, reset: resetSend } = useContactSubmit()
  const {
    register,
    handleSubmit,
    reset: resetForm,
    setFocus,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema), defaultValues: EMPTY })
  const keycapRef = useRef<HTMLButtonElement>(null)
  const sentRef = useRef<HTMLDivElement>(null)
  const restarting = useRef(false)
  const [fieldFocused, setFieldFocused] = useState(false)

  const sending = state.kind === 'sending'
  const sent = state.kind === 'sent'

  useEffect(() => {
    if (sent) sentRef.current?.focus()
  }, [sent])

  // "↺ New message" brings the rows back; focus the name once they exist again.
  useEffect(() => {
    if (state.kind !== 'idle' || !restarting.current) return
    restarting.current = false
    setFocus('name')
  }, [state.kind, setFocus])

  const onValid = (data: ContactFormData): Promise<void> => send(data, keycapRef.current)

  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>): void => {
    if (event.key !== 'Enter' || !(event.ctrlKey || event.metaKey) || sent) return
    event.preventDefault()
    event.currentTarget.requestSubmit()
  }

  const onBlur = (event: FocusEvent<HTMLFormElement>): void => {
    if (!isField(event.relatedTarget)) setFieldFocused(false)
  }

  const startOver = (): void => {
    restarting.current = true
    resetForm(EMPTY)
    resetSend()
  }

  const status: TerminalStatus = sending
    ? { text: 'SENDING', key: 'processing' }
    : fieldFocused
      ? { text: 'INPUT', key: 'input' }
      : { text: 'ONLINE' }

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onValid)(event)}
      onKeyDown={onKeyDown}
      onFocus={(event) => setFieldFocused(isField(event.target))}
      onBlur={onBlur}
      className="chat-terminal relative"
    >
      <span aria-hidden="true" className="chat-corner chat-corner--tl" />
      <span aria-hidden="true" className="chat-corner chat-corner--tr" />
      <span aria-hidden="true" className="chat-corner chat-corner--bl" />
      <span aria-hidden="true" className="chat-corner chat-corner--br" />
      <div aria-hidden="true" className="chat-scanlines" />

      <div className="chat-head relative z-10 flex items-center justify-between gap-3 px-4 py-3 font-mono-label text-[13px] text-slate-200 light:text-slate-800">
        <span>
          &gt; new_message
          <span aria-hidden="true" className="chat-caret" />
        </span>
        <span className="chat-status" data-testid="terminal-status" data-status={status.key}>
          {status.text}
        </span>
      </div>

      <div className="relative z-10 px-2 pt-4 pb-5 sm:px-4">
        {sent ? (
          <div
            ref={sentRef}
            data-testid="terminal-sent"
            tabIndex={-1}
            className="px-2 font-mono-label text-[13px] leading-[1.9] text-slate-400 outline-none light:text-slate-600"
          >
            <p>&gt; sending message… done</p>
            <p className="text-green-400 light:text-green-600">✓ delivered</p>
            <p>&gt; I&apos;ll reply within 24 hours.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={startOver} className={KEYCAP_CLASS}>
                ↺ New message
              </button>
              <button type="button" onClick={onBack} className={KEYCAP_CLASS}>
                ← Portfolio
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mb-2 px-3 font-mono-label text-xs text-slate-500">{'// replies within 24 hours'}</p>
            <PromptRow
              id="contact-name"
              label="name"
              autoComplete="name"
              maxLength={CONTACT_LIMITS.name}
              placeholder="Jane Smith"
              error={errors.name?.message}
              {...register('name')}
            />
            <PromptRow
              id="contact-email"
              label="email"
              type="email"
              autoComplete="email"
              maxLength={CONTACT_LIMITS.email}
              placeholder="jane@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <PromptRow
              id="contact-message"
              label="message"
              multiline
              autoComplete="off"
              maxLength={CONTACT_LIMITS.message}
              placeholder="Tell me about the role or project…"
              error={errors.message?.message}
              {...register('message')}
            />
            {state.kind === 'error' && (
              <p role="alert" className="mt-4 px-3 font-mono-label text-xs text-red-400 light:text-red-600">
                ✗ {state.message}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 px-2">
              <span className="font-mono-label text-[11px] tracking-[0.06em] text-slate-500">
                {IS_APPLE ? '⌘ + ⏎ TO SEND' : 'CTRL + ⏎ TO SEND'}
              </span>
              <button ref={keycapRef} type="submit" aria-disabled={sending || undefined} className={KEYCAP_CLASS}>
                {sending ? 'SENDING…' : '⏎ Send message'}
              </button>
            </div>
          </>
        )}
      </div>

      <p role="status" className="sr-only">
        {sending ? 'Sending your message…' : ''}
      </p>
    </form>
  )
}

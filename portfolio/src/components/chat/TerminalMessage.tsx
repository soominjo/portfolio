import type { ChatMessage } from './chatApi'
import { DecodedMarkdown } from './DecodedMarkdown'

const LABEL = 'mb-1.5 font-mono-label text-[10px] font-medium tracking-[0.18em]'
const ASSISTANT_LABEL = `${LABEL} text-cyan-400 light:text-cyan-600`
const VISITOR_LABEL = `${LABEL} text-indigo-300 light:text-indigo-600`

export interface TerminalMessageProps {
  message: ChatMessage
  onDecoded: (id: string) => void
}

/** One line of the conversation: GENS.AI on a cyan rule, or YOU in an indigo box. */
export function TerminalMessage({ message, onDecoded }: TerminalMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="ml-auto max-w-[92%] text-right">
        <p className={VISITOR_LABEL}>YOU ›</p>
        <p className="inline-block rounded-sm border border-indigo-400/45 bg-indigo-500/10 px-3 py-2 text-left text-[13.5px] leading-normal whitespace-pre-wrap wrap-break-word text-indigo-50 light:text-indigo-950">
          {message.content}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-[92%]">
      <p className={ASSISTANT_LABEL}>GENS.AI ›</p>
      <div className="border-l-2 border-cyan-400/55 pl-3 text-[13.5px] leading-relaxed text-slate-200 light:border-cyan-600/50 light:text-slate-800">
        <DecodedMarkdown
          markdown={message.content}
          decode={message.decode}
          onDone={() => onDecoded(message.id)}
        />
      </div>
    </div>
  )
}

/** The assistant's line while the reply is on its way. */
export function ProcessingRow() {
  return (
    <div className="max-w-[92%]">
      <p className={ASSISTANT_LABEL}>GENS.AI ›</p>
      <div className="flex items-center gap-2.5 border-l-2 border-indigo-400/50 pl-3 font-mono-label text-[10.5px] font-medium tracking-[0.16em] text-indigo-300 light:text-indigo-600">
        <span aria-hidden="true">PROCESSING</span>
        <span aria-hidden="true" className="chat-blocks">
          {Array.from({ length: 8 }, (_, index) => (
            <i key={index} />
          ))}
        </span>
        <span className="sr-only">Waiting for a reply</span>
      </div>
    </div>
  )
}

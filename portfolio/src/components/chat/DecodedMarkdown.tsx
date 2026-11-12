import { useReducedMotion } from 'framer-motion'
import { createContext, useContext, useEffect, useRef, useState, type ComponentProps } from 'react'
import Markdown, { type Components, type ExtraProps } from 'react-markdown'
import { countDecodableChars, decodeFrame, getDecodeDuration, getRevealedCount } from './decode'
import { rehypeDecodeOffsets } from './rehypeDecodeOffsets'

export interface DecodedMarkdownProps {
  markdown: string
  /** True for a fresh reply that should decode in; false shows it as is. */
  decode: boolean
  /** Called once when the reply is fully shown. */
  onDone?: () => void
}

const MARKDOWN_COMPONENTS: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-white light:text-slate-900">{children}</strong>
  ),
}

// Characters settled so far across the whole reply.
const RevealedChars = createContext(0)

function DecodeSpan({ children, ...props }: ComponentProps<'span'> & ExtraProps) {
  const revealed = useContext(RevealedChars)
  const offset = Number((props as Record<string, unknown>)['data-decode-offset'])
  if (Number.isNaN(offset)) return <span>{children}</span>

  const { settled, scrambled, hidden } = decodeFrame(String(children ?? ''), revealed - offset)
  return (
    <span>
      {settled}
      <span data-decode-glyphs className="text-cyan-400/80 light:text-cyan-600/80">
        {scrambled}
      </span>
      <span className="invisible">{hidden}</span>
    </span>
  )
}

const DECODING_COMPONENTS: Components = { ...MARKDOWN_COMPONENTS, span: DecodeSpan }
const DECODING_PLUGINS = [rehypeDecodeOffsets]

/**
 * A Markdown reply that decodes in like the hero name. While it decodes, the
 * real reply stays mounted for screen readers (visually hidden) and an
 * aria-hidden copy shows the scramble in the reply's final layout. When the
 * decode ends, the copy goes and the real reply simply becomes visible, so
 * nothing jumps and the live log announces the reply only once.
 */
export function DecodedMarkdown({ markdown, decode, onDone }: DecodedMarkdownProps) {
  const reduceMotion = useReducedMotion()
  const [done, setDone] = useState(false)
  const [revealed, setRevealed] = useState(0)
  const onDoneRef = useRef(onDone)
  const reportedRef = useRef(false)
  const animating = decode && !reduceMotion && !done

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  // Reported once; never on unmount, or StrictMode's remount would cancel the decode in dev.
  useEffect(() => {
    if (!decode || reportedRef.current || !(reduceMotion || done)) return
    reportedRef.current = true
    onDoneRef.current?.()
  }, [decode, reduceMotion, done])

  useEffect(() => {
    if (!animating) return

    const total = countDecodableChars(markdown)
    const duration = getDecodeDuration(total)
    let start: number | null = null
    let frame = 0

    const step = (now: number) => {
      start ??= now
      const elapsed = now - start
      setRevealed(getRevealedCount(elapsed, duration, total))
      if (elapsed >= duration) {
        setDone(true)
        return
      }
      frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [animating, markdown])

  return (
    <>
      <div data-testid="reply-final" className={animating ? 'sr-only' : undefined}>
        <Markdown components={MARKDOWN_COMPONENTS}>{markdown}</Markdown>
      </div>
      {animating && (
        <div aria-hidden="true" data-testid="reply-decoding">
          <RevealedChars.Provider value={revealed}>
            <Markdown rehypePlugins={DECODING_PLUGINS} components={DECODING_COMPONENTS}>
              {markdown}
            </Markdown>
          </RevealedChars.Provider>
        </div>
      )}
    </>
  )
}

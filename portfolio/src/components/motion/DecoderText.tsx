// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { shuffle, type DecoderChar } from './decoder'

interface DecoderSpring {
  readonly stiffness: number
  readonly damping: number
}

interface DecoderTextProps {
  text: string
  delayMs?: number
  className?: string
  /** How fast the decode resolves. The default is the hero's slow reveal. */
  spring?: DecoderSpring
}

const DECODE_SPRING: DecoderSpring = { stiffness: 8, damping: 5 }

function toValues(text: string): DecoderChar[] {
  return [...text].map((value): DecoderChar => ({ type: 'value', value }))
}

/**
 * Text that scrambles through code characters and resolves left to right.
 * An invisible copy of the final text reserves its size, so surrounding
 * layout never shifts while the wider glyphs flicker.
 */
export function DecoderText({
  text,
  delayMs = 0,
  className,
  spring: springConfig = DECODE_SPRING,
}: DecoderTextProps) {
  const reduceMotion = useReducedMotion()
  const spring = useSpring(0, springConfig)
  const [chars, setChars] = useState<readonly DecoderChar[]>([])

  useEffect(() => {
    if (reduceMotion) return

    const content = [...text]
    let previous: readonly DecoderChar[] = []
    const unsubscribe = spring.on('change', (position) => {
      previous = shuffle(content, previous, position)
      setChars(previous)
    })
    const timer = window.setTimeout(() => spring.set(content.length), delayMs)

    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [text, delayMs, reduceMotion, spring])

  const output = reduceMotion ? toValues(text) : chars

  return (
    <span className={className ? `relative inline-block ${className}` : 'relative inline-block'}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" data-testid="decoder-sizer" className="invisible">
        {text}
      </span>
      <span
        aria-hidden="true"
        data-testid="decoder-output"
        className="absolute inset-0 flex justify-start whitespace-pre"
      >
        {output.map((char, index) => (
          <span
            key={index}
            className={char.type === 'glyph' ? 'font-mono-label font-normal opacity-80' : undefined}
          >
            {char.value}
          </span>
        ))}
      </span>
    </span>
  )
}

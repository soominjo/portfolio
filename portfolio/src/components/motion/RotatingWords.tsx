// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface RotatingWordsProps {
  words: readonly string[]
  intervalMs?: number
  className?: string
}

const EASE = [0.22, 1, 0.36, 1] as const
const REVEAL = { duration: 1.5, delay: 0.6, ease: EASE } as const
const WIPE_CLIP = ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 100%)']
const listFormat = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

/**
 * Cycles through words, revealing each with a cyan block wipe. Assistive
 * tech hears the whole list once instead of a word every few seconds.
 */
export function RotatingWords({ words, intervalMs = 5000, className }: RotatingWordsProps) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion || words.length < 2) return

    const timer = window.setInterval(() => {
      setIndex((previous) => (previous + 1) % words.length)
    }, intervalMs)

    return () => window.clearInterval(timer)
  }, [reduceMotion, words.length, intervalMs])

  if (words.length === 0) return null

  const word = words[index % words.length]

  return (
    <span className={className}>
      <span className="sr-only">{listFormat.format(words)}</span>
      <span aria-hidden="true" className="grid">
        <AnimatePresence>
          <Word key={word} word={word} reveal={!reduceMotion} />
        </AnimatePresence>
      </span>
    </span>
  )
}

interface WordProps {
  word: string
  reveal: boolean
}

function Word({ word, reveal }: WordProps) {
  const isPresent = useIsPresent()

  return (
    <motion.span
      data-testid="rotating-word"
      data-present={isPresent}
      className="relative col-start-1 row-start-1 justify-self-start"
      exit={{ opacity: 0, transition: { duration: 0.5, delay: 0.4 } }}
    >
      <motion.span
        initial={reveal ? { opacity: 0 } : false}
        animate={reveal ? { opacity: [0, 0, 1, 1] } : undefined}
        transition={{ ...REVEAL, times: [0, 0.5, 0.6, 1] }}
      >
        {word}
      </motion.span>
      {reveal && (
        <motion.span
          className="absolute inset-0 bg-cyan-400 light:bg-cyan-600"
          initial={{ clipPath: WIPE_CLIP[0] }}
          animate={{ clipPath: WIPE_CLIP }}
          transition={{ ...REVEAL, times: [0, 0.5, 1] }}
        />
      )}
    </motion.span>
  )
}

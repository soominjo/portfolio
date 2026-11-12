import { motion } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { DecoderText } from '../motion/DecoderText'
import { edgeShift } from './tooltipPosition'
import { SKILL_ATTRIBUTE } from './useActiveSkill'

interface SkillTooltipProps {
  readonly label: string
}

const SCREEN_MARGIN_PX = 8
// Resolves in about 0.1 s, against the hero name's slow reveal.
const DECODE_SPRING = { stiffness: 600, damping: 50 } as const
const POP_IN = { type: 'spring', stiffness: 520, damping: 32 } as const

// Fill and border are shared by the bubble and its pointer; the border takes
// the skill's colour from --mark.
const SURFACE =
  'border-[color-mix(in_oklab,var(--mark)_45%,transparent)] bg-[#0b1020] light:bg-white'

/**
 * The skill's name above its logo, decoded like the hero name. It is
 * decorative: the tile already names the skill for assistive tech. On a
 * narrow screen it slides sideways rather than run off the edge, while its
 * pointer stays on the logo.
 */
export function SkillTooltip({ label }: SkillTooltipProps) {
  const bubbleRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const bubble = bubbleRef.current
    const anchor = bubble?.closest(`[${SKILL_ATTRIBUTE}]`)
    if (!bubble || !anchor) return

    const { left, width } = anchor.getBoundingClientRect()
    const shift = edgeShift({
      center: left + width / 2,
      halfWidth: bubble.offsetWidth / 2,
      viewportWidth: document.documentElement.clientWidth,
      margin: SCREEN_MARGIN_PX,
    })
    bubble.style.left = `${shift}px`
  }, [label])

  return (
    <motion.span
      aria-hidden="true"
      data-testid="skill-tooltip"
      // pb-3 bridges the gap to the logo, so the pointer can move onto the
      // tooltip without it closing.
      className="absolute bottom-full left-1/2 z-30 block pb-3"
      style={{ x: '-50%', originY: 1 }}
      initial={{ opacity: 0, y: 6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.97, transition: { duration: 0.12 } }}
      transition={POP_IN}
    >
      <span
        ref={bubbleRef}
        className={`relative block whitespace-nowrap rounded-lg border px-2.5 py-1.5 font-mono-label text-xs text-slate-100 shadow-[0_12px_30px_-12px_rgba(0,0,0,0.7)] light:text-slate-800 light:shadow-[0_12px_24px_-14px_rgba(15,23,42,0.35)] ${SURFACE}`}
      >
        <DecoderText text={label} spring={DECODE_SPRING} />
      </span>
      <span
        className={`absolute bottom-3 left-1/2 block size-2 -translate-x-1/2 translate-y-1/2 rotate-45 border-r border-b ${SURFACE}`}
      />
    </motion.span>
  )
}

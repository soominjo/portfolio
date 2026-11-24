import type { Transition, Variants } from 'framer-motion'

/** The site's core easing, from docs/DESIGN.md. */
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Header and rows: the site's fade-up, staggered by `custom` (the row index). */
export const rowVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.08, ease: EASE_OUT },
  }),
}

/** A row's skills pop in one after another. */
export const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 420, damping: 28 },
  },
}

/** Springs between rest, active and dimmed. */
export const STATE_SPRING: Transition = { type: 'spring', stiffness: 460, damping: 30 }

/** A text pill at rest, nudged up while active, and faded beside the active one. */
export const PILL_STATE_VARIANTS: Variants = {
  rest: { y: 0, opacity: 1 },
  active: { y: -2, opacity: 1 },
  dimmed: { y: 0, opacity: 0.45 },
}

/** A logo tile at rest, lifted while active, and faded beside the active one. */
export const TILE_STATE_VARIANTS: Variants = {
  rest: { y: 0, scale: 1, opacity: 1, filter: 'saturate(1)' },
  active: { y: -4, scale: 1.08, opacity: 1, filter: 'saturate(1)' },
  dimmed: { y: 0, scale: 0.94, opacity: 0.4, filter: 'saturate(0.3)' },
}

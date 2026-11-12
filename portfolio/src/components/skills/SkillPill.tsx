import { motion, type Variants } from 'framer-motion'
import { MARK_THEME_CLASS, markColorVars, type MarkColors } from './markStyle'
import { STATE_SPRING, itemVariants } from './skillMotion'
import { SKILL_ATTRIBUTE, type SkillHandlers, type SkillState } from './useActiveSkill'

interface SkillPillProps {
  readonly name: string
  /** The skill's logo colour, or the accent for skills without a logo. */
  readonly colors: MarkColors
  readonly state: SkillState
  readonly handlers: SkillHandlers
}

const PILL_STATES: Variants = {
  rest: { y: 0, opacity: 1 },
  active: { y: -2, opacity: 1 },
  dimmed: { y: 0, opacity: 0.45 },
}

const PILL_BASE =
  'inline-flex h-8 items-center gap-2 rounded-full border px-3 font-mono-label text-xs transition-[border-color,background-color,color] duration-300'
const PILL_IDLE = 'border-white/10 text-slate-300 light:border-slate-300 light:text-slate-700'
const PILL_ACTIVE =
  'border-[color-mix(in_oklab,var(--mark)_60%,transparent)] bg-[color-mix(in_oklab,var(--mark)_10%,transparent)] text-white light:text-slate-900'

/** A skill shown by name, with a dot in its logo colour. */
export function SkillPill({ name, colors, state, handlers }: SkillPillProps) {
  return (
    <motion.li
      variants={itemVariants}
      {...{ [SKILL_ATTRIBUTE]: name }}
      data-state={state}
      className={MARK_THEME_CLASS}
      style={markColorVars(colors)}
      {...handlers}
    >
      <motion.span
        initial={false}
        animate={state}
        variants={PILL_STATES}
        transition={STATE_SPRING}
        className={`${PILL_BASE} ${state === 'active' ? PILL_ACTIVE : PILL_IDLE}`}
      >
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-(--mark)" />
        {name}
      </motion.span>
    </motion.li>
  )
}

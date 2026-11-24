import { motion } from 'framer-motion'
import { MARK_ACTIVE_PILL_CLASS, MARK_THEME_CLASS, markColorVars, type MarkColors } from './markStyle'
import { PILL_STATE_VARIANTS, STATE_SPRING, itemVariants } from './skillMotion'
import { SKILL_ATTRIBUTE, type SkillHandlers, type SkillState } from './useActiveSkill'

interface SkillPillProps {
  readonly name: string
  /** The skill's logo colour, or the accent for skills without a logo. */
  readonly colors: MarkColors
  readonly state: SkillState
  readonly handlers: SkillHandlers
}

const PILL_BASE =
  'inline-flex h-8 items-center gap-2 rounded-full border px-3 font-mono-label text-xs transition-[border-color,background-color,color] duration-300'
const PILL_IDLE = 'border-white/10 text-slate-300 light:border-slate-300 light:text-slate-700'

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
        variants={PILL_STATE_VARIANTS}
        transition={STATE_SPRING}
        className={`${PILL_BASE} ${state === 'active' ? MARK_ACTIVE_PILL_CLASS : PILL_IDLE}`}
      >
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-(--mark)" />
        {name}
      </motion.span>
    </motion.li>
  )
}

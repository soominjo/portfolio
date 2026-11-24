import { AnimatePresence, motion } from 'framer-motion'
import { MARK_ACTIVE_TILE_CLASS, MARK_THEME_CLASS, markColorVars } from './markStyle'
import type { SkillMark } from './skillModel'
import { STATE_SPRING, TILE_STATE_VARIANTS, itemVariants } from './skillMotion'
import { SkillTooltip } from './SkillTooltip'
import { SKILL_ATTRIBUTE, type SkillHandlers, type SkillState } from './useActiveSkill'

interface SkillTileProps {
  readonly name: string
  readonly mark: SkillMark
  readonly state: SkillState
  readonly handlers: SkillHandlers
}

const TILE_BASE =
  'flex size-11 items-center justify-center rounded-xl border transition-[border-color,background-color,box-shadow] duration-300'
const TILE_IDLE = 'border-white/[0.08] bg-white/[0.03] light:border-slate-200 light:bg-slate-50'

/** A 44px logo tile. Its name shows in a tooltip while it is active. */
export function SkillTile({ name, mark, state, handlers }: SkillTileProps) {
  return (
    <motion.li
      variants={itemVariants}
      {...{ [SKILL_ATTRIBUTE]: name }}
      data-state={state}
      className={`relative ${MARK_THEME_CLASS}`}
      style={markColorVars(mark)}
      {...handlers}
    >
      <motion.span
        initial={false}
        animate={state}
        variants={TILE_STATE_VARIANTS}
        transition={STATE_SPRING}
        className={`${TILE_BASE} ${state === 'active' ? MARK_ACTIVE_TILE_CLASS : TILE_IDLE}`}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-5 fill-(--mark)">
          <path d={mark.path} />
        </svg>
        <span className="sr-only">{name}</span>
      </motion.span>
      <AnimatePresence>{state === 'active' && <SkillTooltip label={name} />}</AnimatePresence>
    </motion.li>
  )
}

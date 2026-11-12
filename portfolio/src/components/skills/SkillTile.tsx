import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { MARK_THEME_CLASS, markColorVars } from './markStyle'
import type { SkillMark } from './skillModel'
import { STATE_SPRING, itemVariants } from './skillMotion'
import { SkillTooltip } from './SkillTooltip'
import { SKILL_ATTRIBUTE, type SkillHandlers, type SkillState } from './useActiveSkill'

interface SkillTileProps {
  readonly name: string
  readonly mark: SkillMark
  readonly state: SkillState
  readonly handlers: SkillHandlers
}

const TILE_STATES: Variants = {
  rest: { y: 0, scale: 1, opacity: 1, filter: 'saturate(1)' },
  active: { y: -4, scale: 1.08, opacity: 1, filter: 'saturate(1)' },
  dimmed: { y: 0, scale: 0.94, opacity: 0.4, filter: 'saturate(0.3)' },
}

const TILE_BASE =
  'flex size-11 items-center justify-center rounded-xl border transition-[border-color,background-color,box-shadow] duration-300'
const TILE_IDLE = 'border-white/[0.08] bg-white/[0.03] light:border-slate-200 light:bg-slate-50'
// The logo's own colour (--mark) tints the active tile's border, fill and glow.
const TILE_ACTIVE =
  'border-[color-mix(in_oklab,var(--mark)_60%,transparent)] bg-[color-mix(in_oklab,var(--mark)_12%,transparent)] shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--mark)_80%,transparent)] light:shadow-[0_12px_24px_-14px_color-mix(in_oklab,var(--mark)_70%,transparent)]'

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
        variants={TILE_STATES}
        transition={STATE_SPRING}
        className={`${TILE_BASE} ${state === 'active' ? TILE_ACTIVE : TILE_IDLE}`}
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

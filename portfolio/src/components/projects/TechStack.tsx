import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { useEffect } from 'react'
import { readableOn } from '../../lib/brandColor'
import { getTechIcon, type TechIcon } from '../../lib/techIcons'
import {
  MARK_ACTIVE_PILL_CLASS,
  MARK_ACTIVE_TILE_CLASS,
  MARK_THEME_CLASS,
  markColorVars,
  type MarkColors,
} from '../skills/markStyle'
import { ACCENT_COLORS, TILE_COLORS } from '../skills/skillModel'
import { PILL_STATE_VARIANTS, STATE_SPRING, TILE_STATE_VARIANTS } from '../skills/skillMotion'
import { SkillTooltip } from '../skills/SkillTooltip'
import { SKILL_ATTRIBUTE, useActiveSkill, type SkillHandlers, type SkillState } from '../skills/useActiveSkill'
import { techInitials } from './techInitials'

export const MAX_ICONS = 6
export const MAX_CHIPS = 4

// Each stack is a single row, so a hovered logo fades only its own neighbours.
const ROW = 'stack'
// The "+N more" chip's key in that row; no tech is called this.
const MORE = '+more'

const TILE_BASE =
  'flex size-10 items-center justify-center rounded-[10px] border transition-[border-color,background-color,box-shadow] duration-300'
const TILE_IDLE = 'border-indigo-500/25 bg-[#0e121b] light:border-slate-900/10 light:bg-[#f8fafc]'

const MORE_BASE =
  'font-mono-label block rounded-full border px-3 py-1.5 text-[11px] transition-[border-color,background-color,color] duration-300'
const MORE_IDLE = 'border-slate-400/25 text-slate-400 light:border-slate-900/15 light:text-slate-600'

interface TechStackProps {
  readonly items: readonly string[]
  /** Logo tiles for tools; text chips for practices that have no logo. */
  readonly variant: 'icons' | 'chips'
  /**
   * False while the stack's panel is hidden. Scrolling to another project
   * sends no pointer event the logos could hear, so this drops any highlight
   * before it can reappear stale.
   */
  readonly visible?: boolean
}

/**
 * A project's stack as a short row: up to six logo tiles or four chips, then
 * "+N more". Screen readers hear the hidden remainder too. On hover or tap,
 * as in the About tech stack, a logo shows its name and "+N more" lists the
 * rest.
 */
export function TechStack({ items, variant, visible = true }: TechStackProps) {
  const activity = useActiveSkill()
  const { clear } = activity

  useEffect(() => {
    if (!visible) clear()
  }, [visible, clear])

  const limit = variant === 'icons' ? MAX_ICONS : MAX_CHIPS
  const shown = items.slice(0, limit)
  const rest = items.slice(limit)

  return (
    // Under reduced motion, framer drops the lift and keeps the fades.
    <MotionConfig reducedMotion="user">
      {/* role="list": Safari drops list semantics under Tailwind's list-style: none. */}
      <ul role="list" aria-label="Tech stack" className="flex flex-wrap items-center gap-2">
        {shown.map((name) =>
          variant === 'icons' ? (
            <TechTile
              key={name}
              name={name}
              state={activity.stateOf(ROW, name)}
              handlers={activity.handlersFor(ROW, name)}
            />
          ) : (
            <li key={name}>
              <TechChip name={name} />
            </li>
          ),
        )}
        {rest.length > 0 && (
          <MoreChip names={rest} state={activity.stateOf(ROW, MORE)} handlers={activity.handlersFor(ROW, MORE)} />
        )}
      </ul>
    </MotionConfig>
  )
}

/** A logo's colour, made readable on each theme's tile; the cyan accent without a logo. */
function tileColors(icon: TechIcon | null): MarkColors {
  if (!icon) return ACCENT_COLORS
  return {
    dark: readableOn(icon.hex, TILE_COLORS.dark.tile, TILE_COLORS.dark.foreground),
    light: readableOn(icon.hex, TILE_COLORS.light.tile, TILE_COLORS.light.foreground),
  }
}

interface TechTileProps {
  readonly name: string
  readonly state: SkillState
  readonly handlers: SkillHandlers
}

/** A 40px logo tile, or the tech's initials when it has no logo. Its name shows in a tooltip while it is active. */
function TechTile({ name, state, handlers }: TechTileProps) {
  const icon = getTechIcon(name)

  return (
    <li
      {...{ [SKILL_ATTRIBUTE]: name }}
      data-state={state}
      className={`relative ${MARK_THEME_CLASS}`}
      style={markColorVars(tileColors(icon))}
      {...handlers}
    >
      <motion.span
        role="img"
        aria-label={name}
        initial={false}
        animate={state}
        variants={TILE_STATE_VARIANTS}
        transition={STATE_SPRING}
        className={`${TILE_BASE} ${state === 'active' ? MARK_ACTIVE_TILE_CLASS : TILE_IDLE}`}
      >
        {icon ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-(--mark)">
            <path d={icon.path} />
          </svg>
        ) : (
          <span aria-hidden="true" className="font-mono-label text-[11px] text-indigo-300 light:text-indigo-700">
            {techInitials(name)}
          </span>
        )}
      </motion.span>
      <AnimatePresence>{state === 'active' && <SkillTooltip label={name} />}</AnimatePresence>
    </li>
  )
}

interface MoreChipProps {
  /** The tech that didn't fit in the row. */
  readonly names: readonly string[]
  readonly state: SkillState
  readonly handlers: SkillHandlers
}

/** "+N more", which names the tech that didn't fit in a tooltip, the way a logo names itself. */
function MoreChip({ names, state, handlers }: MoreChipProps) {
  const list = names.join(', ')

  return (
    <li
      {...{ [SKILL_ATTRIBUTE]: MORE }}
      data-state={state}
      className={`relative ${MARK_THEME_CLASS}`}
      style={markColorVars(ACCENT_COLORS)}
      {...handlers}
    >
      <motion.span
        initial={false}
        animate={state}
        variants={PILL_STATE_VARIANTS}
        transition={STATE_SPRING}
        className={`${MORE_BASE} ${state === 'active' ? MARK_ACTIVE_PILL_CLASS : MORE_IDLE}`}
      >
        <span aria-hidden="true">+{names.length} more</span>
        <span className="sr-only">Also: {list}</span>
      </motion.span>
      <AnimatePresence>{state === 'active' && <SkillTooltip label={list} />}</AnimatePresence>
    </li>
  )
}

function TechChip({ name }: { readonly name: string }) {
  return (
    <span className="font-mono-label inline-block rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-indigo-200 light:border-indigo-200 light:bg-indigo-50 light:text-indigo-700">
      {name}
    </span>
  )
}

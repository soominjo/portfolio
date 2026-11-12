import { motion } from 'framer-motion'
import { useId } from 'react'
import { ACCENT_COLORS, type SkillRowData } from './skillModel'
import { listVariants, rowVariants } from './skillMotion'
import { SkillPill } from './SkillPill'
import { SkillTile } from './SkillTile'
import type { ActiveSkillApi } from './useActiveSkill'
import type { SkillView } from './ViewToggle'

interface SkillRowProps {
  readonly row: SkillRowData
  readonly index: number
  readonly view: SkillView
  readonly activity: ActiveSkillApi
}

/** One category: its name and count on the left, its skills on the right. */
export function SkillRow({ row, index, view, activity }: SkillRowProps) {
  const headingId = useId()
  const count = row.items.length

  return (
    <motion.div
      custom={index}
      variants={rowVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="group/row grid gap-4 border-t border-white/[0.07] py-7 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10 light:border-slate-200"
    >
      <div className="flex items-baseline justify-between gap-4 md:block">
        <h4
          id={headingId}
          className="flex items-center gap-2.5 text-[15px] font-medium text-slate-300 transition-colors duration-300 group-hover/row:text-white light:text-slate-700 light:group-hover/row:text-slate-900"
        >
          <span aria-hidden="true" className="text-indigo-400/70 light:text-indigo-500">
            {row.glyph}
          </span>
          {row.category}
        </h4>
        <p className="font-mono-label text-xs text-slate-600 transition-colors duration-300 group-hover/row:text-cyan-400/80 md:mt-2 light:text-slate-500 light:group-hover/row:text-cyan-700">
          {count} {count === 1 ? 'skill' : 'skills'}
        </p>
      </div>

      {/* Keyed by view, so switching views replays the staggered entrance. */}
      {/* role="list" because Safari drops list semantics under list-style: none. */}
      <motion.ul
        key={view}
        role="list"
        aria-labelledby={headingId}
        variants={listVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="flex flex-wrap items-center gap-2.5"
      >
        {row.items.map((item) => {
          const state = activity.stateOf(row.category, item.name)
          const handlers = activity.handlersFor(row.category, item.name)

          return view === 'logos' && item.mark ? (
            <SkillTile key={item.name} name={item.name} mark={item.mark} state={state} handlers={handlers} />
          ) : (
            <SkillPill
              key={item.name}
              name={item.name}
              colors={item.mark ?? ACCENT_COLORS}
              state={state}
              handlers={handlers}
            />
          )
        })}
      </motion.ul>
    </motion.div>
  )
}

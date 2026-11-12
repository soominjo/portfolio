import { MotionConfig, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { skillGroups, type SkillGroup } from '../../../../shared/data/skills'
import { buildSkillRows } from './skillModel'
import { rowVariants } from './skillMotion'
import { SkillRow } from './SkillRow'
import { useActiveSkill } from './useActiveSkill'
import { ViewToggle, type SkillView } from './ViewToggle'

interface TechStackProps {
  readonly groups?: readonly SkillGroup[]
}

/**
 * "What I Work With": one row per skill category, each skill a brand logo
 * (or a name, when no logo exists). Hovering or tapping a logo shows its name
 * and dims the rest of its row; the toggle swaps every logo for its name.
 */
export function TechStack({ groups = skillGroups }: TechStackProps) {
  const rows = useMemo(() => buildSkillRows(groups), [groups])
  const [view, setView] = useState<SkillView>('logos')
  const activity = useActiveSkill()

  // The lists remount on a view change, so a pointer resting on a skill never
  // sends the leave that would clear its highlight.
  const changeView = (next: SkillView) => {
    activity.clear()
    setView(next)
  }

  return (
    // Under reduced motion, framer drops the movement and keeps the fades.
    <MotionConfig reducedMotion="user">
      <motion.div
        variants={rowVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="font-mono-label text-xs text-indigo-400 tracking-[0.25em] uppercase mb-3">
            // tech.stack
          </p>
          <h3 className="font-display text-3xl sm:text-4xl font-bold text-white light:text-slate-900">
            What I Work With
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {view === 'logos' && (
            <p className="font-mono-label text-xs text-slate-500">
              <span className="pointer-coarse:hidden">Hover</span>
              <span className="hidden pointer-coarse:inline">Tap</span> a logo for its name, or switch
              to Text
            </p>
          )}
          <ViewToggle value={view} onChange={changeView} />
        </div>
      </motion.div>

      <div className="border-b border-white/[0.07] light:border-slate-200">
        {rows.map((row, index) => (
          <SkillRow key={row.category} row={row} index={index} view={view} activity={activity} />
        ))}
      </div>
    </MotionConfig>
  )
}

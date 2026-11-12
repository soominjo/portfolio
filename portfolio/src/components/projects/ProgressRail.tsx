import type { ShowcaseGroup } from './showcaseOrder'

type SegmentState = 'past' | 'current' | 'upcoming'

interface ProgressRailProps {
  readonly groups: readonly ShowcaseGroup[]
  /** Project titles in showcase order, used as segment tooltips. */
  readonly titles: readonly string[]
  readonly active: number
  readonly onJump: (index: number) => void
  readonly className?: string
}

const SEGMENT_CLASS: Readonly<Record<SegmentState, string>> = {
  past: 'bg-indigo-500/60 light:bg-indigo-500/50',
  current: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] light:bg-cyan-600 light:shadow-none',
  upcoming: 'bg-slate-400/25 group-hover:bg-slate-400/50 light:bg-slate-900/15',
}

function segmentState(index: number, active: number): SegmentState {
  if (index === active) return 'current'
  return index < active ? 'past' : 'upcoming'
}

/**
 * Where you are in the showcase: one segment per project, grouped by
 * category. A mouse shortcut only; keyboard users move through the panels'
 * own buttons, so the rail stays out of the tab order and the a11y tree.
 */
export function ProgressRail({ groups, titles, active, onJump, className = '' }: ProgressRailProps) {
  return (
    <div aria-hidden="true" className={`flex gap-5 ${className}`}>
      {groups.map((group) => (
        <div key={group.category} className="flex flex-col gap-1">
          <div className="flex gap-1.5">
            {titles.slice(group.start, group.end).map((title, offset) => {
              const index = group.start + offset
              const state = segmentState(index, active)
              return (
                <button
                  key={title}
                  type="button"
                  tabIndex={-1}
                  title={title}
                  data-state={state}
                  onClick={() => onJump(index)}
                  className="group cursor-pointer py-2"
                >
                  <span className={`block h-[3px] w-5 rounded-full transition-colors duration-300 sm:w-7 ${SEGMENT_CLASS[state]}`} />
                </button>
              )
            })}
          </div>
          <span
            data-active={active >= group.start && active < group.end}
            className="font-mono-label text-[9.5px] uppercase tracking-[0.18em] text-slate-600 transition-colors data-[active=true]:text-indigo-300 light:text-slate-400 light:data-[active=true]:text-indigo-600"
          >
            {group.label}
          </span>
        </div>
      ))}
    </div>
  )
}

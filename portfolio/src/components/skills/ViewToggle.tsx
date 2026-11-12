import { motion } from 'framer-motion'

export type SkillView = 'logos' | 'text'

interface ViewToggleProps {
  readonly value: SkillView
  readonly onChange: (view: SkillView) => void
}

const OPTIONS: ReadonlyArray<{ readonly value: SkillView; readonly label: string }> = [
  { value: 'logos', label: 'Logos' },
  { value: 'text', label: 'Text' },
]

const THUMB_SPRING = { type: 'spring', stiffness: 420, damping: 34 } as const

// after: stretches each option's hit area to 44px tall without changing its look.
const OPTION_BASE =
  'relative h-9 rounded-full px-4 text-sm font-medium transition-colors duration-200 after:absolute after:inset-x-0 after:-inset-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400'
const OPTION_SELECTED = 'text-slate-900 light:text-white'
const OPTION_IDLE =
  'text-slate-400 hover:text-white light:text-slate-500 light:hover:text-slate-900'

/** Segmented switch between logo tiles and plain names. */
export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Show skills as"
      className="inline-flex rounded-full border border-white/10 bg-white/[0.02] p-1 light:border-slate-200 light:bg-slate-50"
    >
      {OPTIONS.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`${OPTION_BASE} ${selected ? OPTION_SELECTED : OPTION_IDLE}`}
          >
            {selected && (
              <motion.span
                layoutId="tech-stack-view-thumb"
                transition={THUMB_SPRING}
                className="absolute inset-0 rounded-full bg-slate-100 light:bg-slate-900"
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}

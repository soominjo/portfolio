import { createPortal } from 'react-dom'
import { BACKGROUND_OPTIONS, type BackgroundId } from './backgroundLab'

interface BackgroundSwitcherProps {
  value: BackgroundId
  onChange: (id: BackgroundId) => void
}

const BUTTON_BASE =
  'shrink-0 rounded-full px-3 py-2 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400'
const BUTTON_ACTIVE = 'bg-indigo-500/20 text-white ring-1 ring-indigo-400/60 light:text-slate-900'
const BUTTON_IDLE = 'text-slate-400 hover:text-white light:text-slate-500 light:hover:text-slate-900'

/**
 * Floating picker for the background lab. It renders into <body> so the
 * hero's overflow can't clip it. On phones it sits left of the chat button,
 * and from md up it sits bottom-centre, clear of the side nav. It stays
 * below the phone menu (z-55), so the open menu covers it.
 */
export function BackgroundSwitcher({ value, onChange }: BackgroundSwitcherProps) {
  return createPortal(
    <div
      role="group"
      aria-label="Hero background"
      className="fixed bottom-5 left-4 right-24 z-50 flex items-center gap-1 overflow-x-auto rounded-full border border-indigo-500/30 bg-[#05070f]/85 p-1 shadow-lg shadow-indigo-500/10 backdrop-blur-xl light:bg-white/85 md:right-auto md:left-1/2 md:max-w-[calc(100vw-14rem)] md:-translate-x-1/2"
    >
      <span
        aria-hidden="true"
        className="shrink-0 px-3 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-400"
      >
        BG lab
      </span>
      {BACKGROUND_OPTIONS.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`${BUTTON_BASE} ${active ? BUTTON_ACTIVE : BUTTON_IDLE}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>,
    document.body,
  )
}

import { lazy, Suspense, useCallback, useState, type Ref } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { DecorativeBoundary } from '../DecorativeBoundary'

// WebGL code is heavy, so the orb is its own chunk that loads after first paint.
const ChatOrb = lazy(() => import('../three/ChatOrb'))

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]'

export interface ChatLauncherProps {
  open: boolean
  controlsId: string
  theme: Theme
  onToggle: () => void
  ref?: Ref<HTMLButtonElement>
}

/**
 * The chat button: a living orb in the corner. A CSS orb holds its place until
 * the 3D orb has drawn (or for good, without WebGL). While the chat is open the
 * orb tucks away and a cyan × takes its place.
 */
export function ChatLauncher({ open, controlsId, theme, onToggle, ref }: ChatLauncherProps) {
  const [orbReady, setOrbReady] = useState(false)
  const markOrbReady = useCallback(() => setOrbReady(true), [])

  return (
    <button
      ref={ref}
      type="button"
      aria-label={open ? 'Close chat' : 'Open chat'}
      aria-expanded={open}
      aria-controls={controlsId}
      data-open={open}
      onClick={onToggle}
      className="group fixed right-4 bottom-4 z-50 grid size-16 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400 sm:right-6 sm:bottom-5 sm:size-18"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 transition-opacity duration-300 group-data-[open=true]:opacity-0"
      >
        <span className="chat-halo absolute inset-0 rounded-full" />
      </span>

      <span
        aria-hidden="true"
        data-testid="chat-orb"
        className={`relative size-full transition duration-500 ${EASE} group-hover:scale-108 group-data-[open=true]:scale-30 group-data-[open=true]:opacity-0 motion-reduce:transition-none`}
      >
        {!orbReady && (
          <span data-testid="chat-orb-fallback" className="chat-orb-fallback absolute inset-3.5 rounded-full" />
        )}
        <DecorativeBoundary>
          <Suspense fallback={null}>
            <ChatOrb theme={theme} paused={open} onReady={markOrbReady} />
          </Suspense>
        </DecorativeBoundary>
      </span>

      <span
        aria-hidden="true"
        data-testid="chat-orb-close"
        className={`absolute inset-3 grid scale-40 -rotate-90 place-items-center rounded-full border border-cyan-400/50 bg-[#060a16]/95 text-cyan-400 opacity-0 shadow-[0_0_22px_rgba(34,211,238,0.2)] transition duration-500 ${EASE} group-data-[open=true]:scale-100 group-data-[open=true]:rotate-0 group-data-[open=true]:opacity-100 motion-reduce:transition-none light:border-cyan-600/50 light:bg-white light:text-cyan-600 light:shadow-[0_8px_20px_-8px_rgba(8,145,178,0.45)]`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </span>
    </button>
  )
}

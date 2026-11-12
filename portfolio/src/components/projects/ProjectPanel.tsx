import { useId } from 'react'
import type { Project } from '../../../../shared/types/project'
import { formatIndex, metaLine, PANEL_SPACING, titleSizeClass } from './panelText'
import { TechStack } from './TechStack'
import type { ViewportFit } from './useViewportFit'

interface ProjectPanelProps {
  readonly project: Project
  readonly index: number
  readonly total: number
  readonly active: boolean
  /** Short screens get tighter type and spacing. */
  readonly fit?: ViewportFit
  readonly onOpenDetails: (project: Project) => void
  /** Called when keyboard focus lands in this panel while another is shown. */
  readonly onFocusInactive: (index: number) => void
}

// The panels sit stacked on top of each other, so only the visible one may
// take clicks. A panel holding keyboard focus shows at once, ahead of the
// scroll that makes it active, so the focus ring is never invisible.
const VISIBILITY = {
  active: 'pointer-events-auto translate-y-0 opacity-100',
  inactive: 'pointer-events-none translate-y-3 opacity-0 focus-within:translate-y-0 focus-within:opacity-100 focus-within:transition-none',
} as const

/**
 * One project's text in the showcase: number, details line, title, tagline,
 * stack and "View more". Every panel stays in the DOM (screen readers can read
 * them all); only the active one is visible.
 */
export function ProjectPanel({ project, index, total, active, fit = 'regular', onOpenDetails, onFocusInactive }: ProjectPanelProps) {
  const titleId = useId()
  const density = fit === 'regular' ? 'regular' : 'compact'
  const spacing = PANEL_SPACING[density]

  return (
    <article
      aria-labelledby={titleId}
      data-active={active}
      onFocus={active ? undefined : () => onFocusInactive(index)}
      className={`w-full max-w-xl transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${active ? VISIBILITY.active : VISIBILITY.inactive}`}
    >
      <p className={`font-mono-label flex items-center gap-3 text-sm text-slate-200 light:text-slate-800 ${spacing.index}`}>
        <span aria-hidden="true" className="h-0.5 w-12 bg-linear-to-r from-indigo-500 to-cyan-400" />
        <span>{formatIndex(index + 1)}</span>
        <span className="text-slate-600 light:text-slate-400">/ {formatIndex(total)}</span>
      </p>

      <p className={`font-mono-label text-[11px] uppercase tracking-[0.16em] text-slate-500 light:text-slate-600 ${spacing.meta}`}>
        {metaLine(project)}
      </p>

      <h3
        id={titleId}
        className={`font-display font-bold leading-[1.02] tracking-tight text-white light:text-slate-900 ${spacing.title} ${titleSizeClass(project.title, density)}`}
      >
        {project.title}
      </h3>

      <p className={`max-w-md leading-relaxed text-slate-300 light:text-slate-600 ${spacing.tagline}`}>{project.tagline}</p>

      <div className={spacing.stack}>
        <TechStack items={project.techStack} variant={project.category === 'qa' ? 'chips' : 'icons'} />
      </div>

      <button
        type="button"
        aria-label={`View more about ${project.title}`}
        onClick={() => onOpenDetails(project)}
        className={`btn-glow inline-flex items-center gap-2.5 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${spacing.button}`}
      >
        View more <span aria-hidden="true">&rarr;</span>
      </button>
    </article>
  )
}

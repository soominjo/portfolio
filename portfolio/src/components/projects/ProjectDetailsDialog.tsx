import { useEffect, useId, useRef, type MouseEvent } from 'react'
import type { Project } from '../../../../shared/types/project'
import { metaLine } from './panelText'

interface ProjectDetailsDialogProps {
  /** The project to show; null keeps the dialog closed. */
  readonly project: Project | null
  readonly onClose: () => void
}

/**
 * "View more": a native modal dialog with the full description, the whole
 * stack and the screenshots. The browser handles focus, Escape and the
 * backdrop; every way of closing reports through the dialog's close event.
 */
export function ProjectDetailsDialog({ project, onClose }: ProjectDetailsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (project && !dialog.open) dialog.showModal()
    if (!project && dialog.open) dialog.close()
  }, [project])

  const close = () => dialogRef.current?.close()

  // The dialog has no padding of its own, so a click whose target is the
  // dialog itself landed on the backdrop.
  const onDialogClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={onDialogClick}
      className="m-auto max-h-[calc(100svh-2rem)] w-[min(56rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-indigo-500/25 bg-[#070b14] p-0 text-slate-300 shadow-2xl backdrop:bg-[#05070f]/80 backdrop:backdrop-blur-sm light:border-slate-900/10 light:bg-white light:text-slate-600"
    >
      {project && (
        <div className="p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono-label mb-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">{metaLine(project)}</p>
              <h2 id={titleId} className="font-display text-3xl font-bold text-white light:text-slate-900 sm:text-4xl">
                {project.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="font-mono-label shrink-0 rounded-lg border border-slate-700 px-4 py-2 text-xs uppercase tracking-widest text-slate-400 transition-colors hover:border-slate-500 hover:text-white light:border-slate-300 light:text-slate-600 light:hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <div className="mb-6 flex items-start gap-4">
            {project.imageUrl && (
              <img
                src={project.imageUrl}
                alt={`${project.title} on desktop`}
                loading="lazy"
                className="min-w-0 flex-1 rounded-lg border border-white/10 light:border-slate-900/10"
              />
            )}
            {project.mobileImageUrl && (
              <img
                src={project.mobileImageUrl}
                alt={`${project.title} on mobile`}
                loading="lazy"
                className="w-[22%] rounded-xl border border-white/10 light:border-slate-900/10"
              />
            )}
          </div>

          <p className="mb-6 leading-relaxed">{project.purpose}</p>

          <h3 className="font-mono-label mb-3 text-xs uppercase tracking-widest text-indigo-400 light:text-indigo-600">Tech stack</h3>
          <ul className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <li
                key={tech}
                className="font-mono-label rounded border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-300 light:border-[#c7d2e0] light:bg-[#e1e8f0] light:font-semibold light:text-[#2c3e50]"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      )}
    </dialog>
  )
}

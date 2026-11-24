import type { Project } from '../../../../shared/types/project'

interface LiveSiteLinkProps {
  readonly project: Pick<Project, 'title' | 'liveUrl'>
  /** Spacing and padding for where the link sits. */
  readonly className?: string
}

/**
 * "Visit site ↗": opens the project's public site in a new tab. Renders
 * nothing for a project without one.
 */
export function LiveSiteLink({ project, className = '' }: LiveSiteLinkProps) {
  if (!project.liveUrl) return null

  return (
    <a
      href={project.liveUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit site for ${project.title} (opens in a new tab)`}
      className={`inline-flex items-center gap-2 rounded-lg border border-slate-600 px-5 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400 hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 light:border-slate-300 light:text-slate-700 light:hover:border-cyan-700 light:hover:text-cyan-700 ${className}`}
    >
      Visit site <span aria-hidden="true">&#8599;</span>
    </a>
  )
}

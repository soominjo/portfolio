import { motion } from 'framer-motion'
import type { Project } from '../../../../shared/types/project'

interface ProjectCardProps {
  project: Project
  index: number
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="card-glass flex flex-col rounded-xl overflow-hidden"
    >
      {/* Image / Gradient header */}
      {project.imageUrl ? (
        <div className="h-44 overflow-hidden">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover opacity-80"
          />
        </div>
      ) : (
        <div
          className="h-44 flex items-center justify-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(34,211,238,0.08) 100%)',
          }}
        >
          <span className="font-display text-6xl font-bold text-indigo-500/20 select-none">
            {project.title.charAt(0)}
          </span>
          <div className="absolute inset-0 grid-bg opacity-50" />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        <div>
          <p className="font-mono-label text-xs text-cyan-400/80 light:text-[#008080] uppercase tracking-widest mb-1.5">
            {project.role}
          </p>
          <h3 className="font-display text-lg font-bold text-white light:text-[#1a1a1a]">
            {project.title}
          </h3>
        </div>

        <p className="text-sm text-slate-400 light:text-[#4a4a4a] leading-relaxed flex-1">
          {project.purpose}
        </p>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map(tech => (
            <span
              key={tech}
              className="font-mono-label px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 light:bg-[#e1e8f0] text-indigo-300 light:text-[#2c3e50] light:font-semibold border border-indigo-500/20 light:border-[#c7d2e0]"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-4 pt-3 border-t border-white/6 light:border-[#e0e0e0]">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono-label text-xs text-cyan-400 light:text-[#0056b3] hover:text-cyan-300 light:hover:text-[#003d82] transition-colors"
            >
              <ExternalLinkIcon />
              Live Demo
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono-label text-xs text-slate-500 light:text-slate-600 hover:text-slate-300 light:hover:text-slate-800 transition-colors"
            >
              <GitHubIcon />
              Source
            </a>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function ExternalLinkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

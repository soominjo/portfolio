import { motion } from 'framer-motion'
import type { Project, ProjectType } from '../../../../shared/types/project'

interface ProjectCardProps {
  project: Project
  index: number
}

const typeBadge: Record<ProjectType, { label: string; className: string }> = {
  personal: {
    label: 'Personal',
    className:
      'bg-emerald-500/10 light:bg-emerald-50 text-emerald-300 light:text-emerald-700 border-emerald-500/25 light:border-emerald-200',
  },
  professional: {
    label: 'Professional',
    className:
      'bg-indigo-500/10 light:bg-indigo-50 text-indigo-300 light:text-indigo-700 border-indigo-500/25 light:border-indigo-200',
  },
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
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <p className="font-mono-label text-xs text-cyan-400/80 light:text-[#008080] uppercase tracking-widest">
              {project.role}
            </p>
            <span
              className={`font-mono-label shrink-0 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest border ${typeBadge[project.type].className}`}
            >
              {typeBadge[project.type].label}
            </span>
          </div>
          <h3 className="font-display text-lg font-bold text-white light:text-[#1a1a1a]">
            {project.title}
          </h3>
        </div>

        <p className="text-sm text-slate-400 light:text-[#4a4a4a] leading-relaxed flex-1">
          {project.purpose}
        </p>

        {/* Tech badges */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-white/6 light:border-[#e0e0e0]">
          {project.techStack.map(tech => (
            <span
              key={tech}
              className="font-mono-label px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 light:bg-[#e1e8f0] text-indigo-300 light:text-[#2c3e50] light:font-semibold border border-indigo-500/20 light:border-[#c7d2e0]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

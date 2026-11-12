import { motion } from 'framer-motion'
import { useProjects } from '../../hooks/useProjects'
import { ProjectShowcase } from '../projects/ProjectShowcase'

export function Projects() {
  const { projects } = useProjects()

  return (
    <section id="projects" className="relative bg-[#05070f] light:bg-[#f7f9fc]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

      {/* Section header */}
      <div className="clear-side-nav px-6 pt-28 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto"
        >
          <p className="font-mono-label text-xs text-indigo-400 tracking-[0.25em] uppercase mb-3">
            // my.work
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white light:text-slate-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-slate-500 light:text-slate-600 max-w-lg text-sm leading-relaxed">
            Projects spanning full-stack engineering and quality assurance — two sides of how I ship reliable software.
          </p>
        </motion.div>
      </div>

      <ProjectShowcase projects={projects} />
    </section>
  )
}

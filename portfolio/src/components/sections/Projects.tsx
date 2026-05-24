import { motion } from 'framer-motion'
import { useProjects } from '../../hooks/useProjects'
import { ProjectCard } from './ProjectCard'

export function Projects() {
  const { projects, loading, error } = useProjects()

  return (
    <section id="projects" className="relative py-28 px-6 bg-[#05070f]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="font-mono-label text-xs text-indigo-400 tracking-[0.25em] uppercase mb-3">
            // my.work
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
            A selection of projects that showcase my full-stack development, AI integration, and QA skills.
          </p>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-xl card-glass animate-pulse"
              >
                <div className="h-44 bg-white/3 rounded-t-xl" />
                <div className="p-5 flex flex-col gap-3">
                  <div className="h-2.5 w-20 bg-white/5 rounded-full" />
                  <div className="h-4 w-3/4 bg-white/5 rounded-full" />
                  <div className="h-2.5 w-full bg-white/5 rounded-full" />
                  <div className="h-2.5 w-5/6 bg-white/5 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="font-mono-label text-xs text-slate-600 mb-1">ERR_LOAD_FAILED</p>
            <p className="text-slate-500 text-sm">Could not load projects right now.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-16">
            <p className="font-mono-label text-xs text-slate-600">// projects coming soon</p>
          </div>
        )}

        {/* Project cards */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { useProjects } from '../../hooks/useProjects'
import { ProjectCard } from './ProjectCard'

export function Projects() {
  const { projects, loading, error } = useProjects()

  return (
    <section id="projects" className="py-24 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
          className="text-center mb-16"
        >
          <p className="text-indigo-500 dark:text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-3">
            My Work
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            A selection of projects that showcase my full-stack development and QA skills.
          </p>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse"
              >
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-t-2xl" />
                <div className="p-6 flex flex-col gap-3">
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400 mb-2">
              Could not load projects right now.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400">
              Projects coming soon.
            </p>
          </div>
        )}

        {/* Project cards */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

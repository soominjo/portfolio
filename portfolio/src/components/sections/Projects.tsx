import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProjects } from '../../hooks/useProjects'
import { ProjectCard } from './ProjectCard'
import type { ProjectCategory } from '../../types/project'

const tabs: { id: ProjectCategory; label: string }[] = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'qa', label: 'QA Engineering' },
]

export function Projects() {
  const { projects } = useProjects()
  const [activeTab, setActiveTab] = useState<ProjectCategory>('engineering')

  const filtered = projects.filter(p => p.category === activeTab)

  return (
    <section id="projects" className="relative py-28 px-6 bg-[#05070f] light:bg-[#f7f9fc]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-cyan-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12"
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

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-white/5 light:bg-slate-900/5 border border-white/6 light:border-slate-900/10">
            {tabs.map(tab => {
              const count = projects.filter(p => p.category === tab.id).length
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative font-mono-label text-xs tracking-widest uppercase px-5 py-2.5 rounded-full flex items-center gap-2 transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300 light:hover:text-slate-700'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-full bg-indigo-600"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  <span
                    className={`relative z-10 text-[10px] ${
                      isActive ? 'text-indigo-200' : 'text-slate-600 light:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Project grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-6 gap-6"
        >
          {filtered.map((project, index) => {
            const isBottomRow = filtered.length === 5 && index >= 3
            const colClass = isBottomRow && index === 3
              ? 'col-span-1 sm:col-start-2 sm:col-span-2'
              : 'col-span-1 sm:col-span-2'
            return (
              <div key={project.id} className={colClass}>
                <ProjectCard project={project} index={index} />
              </div>
            )
          })}
        </motion.div>

      </div>
    </section>
  )
}

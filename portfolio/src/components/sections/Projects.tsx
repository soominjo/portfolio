import { useState } from 'react'
import { motion } from 'framer-motion'
import { useProjects } from '../../hooks/useProjects'
import { ProjectCard } from './ProjectCard'
import type { ProjectCategory } from '../../types/project'

const tabs: { id: ProjectCategory; label: string; mono: string }[] = [
  { id: 'engineering', label: 'Engineering', mono: '// software.dev' },
  { id: 'qa', label: 'QA Engineering', mono: '// quality.assurance' },
]

export function Projects() {
  const { projects } = useProjects()
  const [activeTab, setActiveTab] = useState<ProjectCategory>('engineering')

  const filtered = projects.filter(p => p.category === activeTab)
  const activeTabData = tabs.find(t => t.id === activeTab)!

  return (
    <section id="projects" className="relative py-28 px-6 bg-[#05070f]">
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
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Featured Projects
          </h2>
          <p className="text-slate-500 max-w-lg text-sm leading-relaxed">
            Projects spanning full-stack engineering and quality assurance — two sides of how I ship reliable software.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex gap-0 border-b border-white/6 mb-12"
        >
          {tabs.map(tab => {
            const count = projects.filter(p => p.category === tab.id).length
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative font-mono-label text-xs tracking-widest uppercase py-3 px-5 transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-slate-600 hover:text-slate-400'
                }`}
              >
                {tab.label}
                <span className={`ml-2 text-[10px] ${isActive ? 'text-indigo-400' : 'text-slate-700'}`}>
                  {count}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-px bg-indigo-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </motion.div>

        {/* Active tab label */}
        <motion.p
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="font-mono-label text-[10px] text-slate-700 tracking-widest uppercase mb-6"
        >
          {activeTabData.mono}
        </motion.p>

        {/* Project grid */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-6 gap-6"
        >
          {filtered.map((project, index) => {
            const isBottomRow = filtered.length === 5 && index >= 3
            const colClass = isBottomRow && index === 3
              ? 'col-start-2 col-span-2'
              : isBottomRow
              ? 'col-span-2'
              : 'col-span-2'
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

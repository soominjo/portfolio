import { motion, type Variants } from 'framer-motion'
import { useExperience } from '../../hooks/useExperience'
import { TechStack } from '../skills/TechStack'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function About() {
  const { experience } = useExperience()

  return (
    <section id="about" className="relative py-28 px-6 clear-side-nav bg-[#070b14] light:bg-white">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />

      {/* #experience covers the timeline and the tech stack, so the nav's
          "Experience" stays current through both (About has no link of its own). */}
      <div id="experience" className="max-w-6xl mx-auto scroll-mt-20 desk:scroll-mt-0">
        {/* Experience */}
        <div className="max-w-4xl mb-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="mb-16"
          >
            <p className="font-mono-label text-xs text-indigo-400 tracking-[0.25em] uppercase mb-3">
              // career.log
            </p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white light:text-slate-900 mb-4">
              Experience
            </h2>
            <p className="text-slate-500 light:text-slate-600 max-w-lg text-sm leading-relaxed">
              Software Engineer building AI-powered, full-stack systems — from RAG pipelines and
              computer vision to production platforms used by hundreds of people.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1.75 top-2 bottom-2 w-px bg-linear-to-b from-indigo-500/40 light:from-indigo-500/25 via-indigo-500/15 light:via-indigo-500/10 to-transparent" />

            {experience.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-6 sm:gap-8 pb-16 last:pb-0"
              >
                {/* Timeline node */}
                <div className="relative z-10 shrink-0 pt-1.5">
                  <span
                    className={`block w-3.75 h-3.75 rounded-full border-2 ${
                      item.current
                        ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                        : 'bg-[#070b14] light:bg-white border-indigo-500/50 light:border-indigo-500/60'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="font-mono-label text-xs text-indigo-400 light:text-indigo-600 tracking-widest uppercase">
                      {item.year}
                    </span>
                    {item.current && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-green-500/30 bg-green-500/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        <span className="font-mono-label text-[10px] text-green-400 light:text-green-600 tracking-widest uppercase">
                          Current
                        </span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white light:text-slate-900 mb-1">
                    {item.role}
                  </h3>
                  <p className="font-mono-label text-xs text-cyan-400/80 light:text-[#008080] uppercase tracking-widest mb-4">
                    {item.company}
                  </p>

                  <ul className="space-y-3 mb-5">
                    {item.highlights.map(highlight => (
                      <li
                        key={highlight}
                        className="flex gap-3 text-sm text-slate-400 light:text-[#4a4a4a] leading-relaxed"
                      >
                        <span className="mt-2 w-1 h-1 rounded-full bg-cyan-500/60 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-1.5">
                    {item.techStack.map(tech => (
                      <span
                        key={tech}
                        className="font-mono-label px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 light:bg-[#e1e8f0] text-indigo-300 light:text-[#2c3e50] light:font-semibold border border-indigo-500/20 light:border-[#c7d2e0]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <TechStack />
      </div>

      {/* Subtle bottom border glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />
    </section>
  )
}

import { motion, type Variants } from 'framer-motion'

const skillGroups = [
  {
    category: 'Frontend',
    icon: '⬡',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'],
  },
  {
    category: 'Backend',
    icon: '◈',
    skills: ['Node.js', 'Python', 'Django', 'Firebase', 'REST APIs'],
  },
  {
    category: 'AI & Data',
    icon: '◎',
    skills: ['RAG Pipelines', 'LLM Integration', 'Computer Vision', 'Gemini', 'Vectorization'],
  },
  {
    category: 'QA & DevOps',
    icon: '◇',
    skills: ['Playwright', 'Vitest', 'Git', 'CI/CD', 'Vercel'],
  },
]

const facts = [
  { label: 'Role', value: 'Junior Software Engineer @ Hytel Pte Ltd.' },
  { label: 'Focus', value: 'React · TypeScript · AI Integration · QA' },
  { label: 'Location', value: 'Bacoor City, Cavite, Philippines' },
  { label: 'Email', value: 'genesis060102@gmail.com' },
  { label: 'Status', value: 'Employed · Open to opportunities' },
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function About() {
  return (
    <section id="about" className="relative py-28 px-6 bg-[#070b14]">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16"
        >
          <p className="font-mono-label text-xs text-indigo-400 tracking-[0.25em] uppercase mb-3">
            // about.sys
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">
            Developer &amp; QA Engineer
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-16 items-start mb-24">
          {/* Bio */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-5"
          >
            <p className="text-slate-300 leading-relaxed text-lg">
              I&apos;m a Full-Stack Developer &amp; Junior Software Engineer based in Bacoor
              City, Cavite, Philippines. I graduated With Honors in Information Technology
              from Cavite State University and currently build AI-powered applications at
              Hytel Pte Ltd. — integrating RAG pipelines, computer vision, and LLM features
              into real production systems.
            </p>
            <p className="text-slate-400 leading-relaxed">
              My background spans frontend engineering, full-stack development, and
              cross-functional QA. I was promoted from IT Intern to Full Stack Developer
              at Inner SPARC Realty after delivering a commission platform used by 128
              people that boosted operational efficiency by 30%.
            </p>
            <p className="text-slate-500 leading-relaxed">
              Always building something new — AI legal assistants, fitness trackers,
              mental health platforms. I love turning complex problems into clean,
              reliable software that real users depend on.
            </p>
          </motion.div>

          {/* Quick facts — terminal style */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="card-glass rounded-xl p-6 space-y-0"
          >
            <p className="font-mono-label text-xs text-slate-600 mb-4 pb-3 border-b border-indigo-500/10">
              ~ genessis/profile.json
            </p>
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className="flex gap-3 py-2.5 border-b border-white/4 last:border-0"
              >
                <span className="font-mono-label text-xs text-indigo-400 w-20 shrink-0 pt-0.5">
                  {fact.label}
                </span>
                <span className="font-mono-label text-xs text-slate-300 leading-relaxed">
                  {i === 3 ? (
                    <a href={`mailto:${fact.value}`} className="hover:text-cyan-400 transition-colors">
                      {fact.value}
                    </a>
                  ) : fact.value}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Skills */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10"
        >
          <p className="font-mono-label text-xs text-indigo-400 tracking-[0.25em] uppercase mb-3">
            // tech.stack
          </p>
          <h3 className="font-display text-3xl sm:text-4xl font-bold text-white">
            What I Work With
          </h3>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.category}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08 }}
              className="card-glass rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-indigo-400 text-lg">{group.icon}</span>
                <h4 className="font-mono-label text-xs text-indigo-400 tracking-widest uppercase">
                  {group.category}
                </h4>
              </div>
              <ul className="space-y-2">
                {group.skills.map(skill => (
                  <li
                    key={skill}
                    className="flex items-center gap-2 text-sm text-slate-400"
                  >
                    <span className="w-1 h-1 rounded-full bg-cyan-500/60 shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subtle bottom border glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />
    </section>
  )
}

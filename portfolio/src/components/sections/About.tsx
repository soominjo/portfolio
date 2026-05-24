import { motion, type Variants } from 'framer-motion'

const skillGroups = [
  {
    category: 'Frontend',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Vite'],
  },
  {
    category: 'Backend',
    skills: ['Node.js', 'Express', 'Firebase', 'REST APIs', 'Serverless'],
  },
  {
    category: 'QA & Testing',
    skills: ['Playwright', 'Vitest', 'Cypress', 'Test Planning', 'Bug Triage'],
  },
  {
    category: 'DevOps & Tools',
    skills: ['Git', 'GitHub Actions', 'Vercel', 'CI/CD', 'Lighthouse'],
  },
]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
}

export function About() {
  return (
    <section id="about" className="py-24 px-6 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-16"
        >
          <p className="text-indigo-500 dark:text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-3">
            About Me
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Developer &amp; QA Engineer
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-start mb-20">
          {/* Bio */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-6">
              I&apos;m a Full-Stack Developer &amp; Junior Software Engineer based in Bacoor
              City, Cavite, Philippines. I graduated With Honors in Information Technology
              from Cavite State University and currently build AI-powered applications at
              Hytel Pte Ltd. — integrating RAG pipelines, computer vision, and LLM features
              into real production systems.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg mb-6">
              My background spans frontend engineering, full-stack development, and
              cross-functional QA. I was promoted from IT Intern to Full Stack Developer
              at Inner SPARC Realty after delivering a commission platform used by 128
              people that boosted operational efficiency by 30%. I bring a QA mindset to
              every line of code I write — fewer bugs, smoother releases, better products.
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              I&apos;m always building something new — whether it&apos;s an AI legal
              assistant, a fitness tracker, or a mental health platform. I love tackling
              complex problems and turning them into clean, reliable software that real
              users depend on.
            </p>
          </motion.div>

          {/* Quick facts */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex flex-col gap-4"
          >
            {[
              { label: 'Role', value: 'Junior Software Engineer @ Hytel Pte Ltd.' },
              { label: 'Focus', value: 'React · TypeScript · AI Integration · QA' },
              { label: 'Location', value: 'Bacoor City, Cavite, Philippines' },
              { label: 'Email', value: 'genesis060102@gmail.com' },
              { label: 'Status', value: 'Employed · Open to opportunities' },
            ].map(fact => (
              <div
                key={fact.label}
                className="flex gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <span className="text-indigo-500 dark:text-indigo-400 font-semibold text-sm w-20 shrink-0 pt-0.5">
                  {fact.label}
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-sm">
                  {fact.value}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Skills grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-10"
        >
          <p className="text-indigo-500 dark:text-indigo-400 font-semibold text-sm tracking-widest uppercase mb-3">
            Tech Stack
          </p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            What I Work With
          </h3>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.category}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <h4 className="text-indigo-500 dark:text-indigo-400 font-bold text-xs tracking-widest uppercase mb-4">
                {group.category}
              </h4>
              <ul className="flex flex-col gap-2">
                {group.skills.map(skill => (
                  <li
                    key={skill}
                    className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

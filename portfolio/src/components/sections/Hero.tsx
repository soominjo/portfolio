import { motion, type Variants } from 'framer-motion'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden"
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg" />

      {/* Gradient blobs */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-100 h-100 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-4xl mx-auto">
        {/* Status badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono-label text-xs text-green-400 tracking-widest uppercase">
            Available for opportunities
          </span>
        </motion.div>

        {/* Name */}
        <motion.h1
          custom={0.1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display text-6xl sm:text-7xl md:text-8xl font-bold text-white leading-none tracking-tight mb-2"
        >
          Genessis
        </motion.h1>
        <motion.h1
          custom={0.2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-display text-6xl sm:text-7xl md:text-8xl font-bold leading-none tracking-tight mb-8 glow-text"
          style={{ color: '#818cf8' }}
        >
          Contreras
        </motion.h1>

        {/* Role */}
        <motion.p
          custom={0.3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-mono-label text-xs sm:text-sm text-slate-500 tracking-[0.25em] uppercase mb-6"
        >
          Full-Stack Developer &nbsp;·&nbsp; QA Engineer &nbsp;·&nbsp; AI Builder
        </motion.p>

        {/* Description */}
        <motion.p
          custom={0.4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          I build AI-powered, full-stack web applications — combining clean frontend
          engineering with RAG pipelines, LLM integrations, and a rigorous QA mindset
          to ship products that work reliably from day one.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={0.5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <a
            href="#projects"
            className="btn-glow px-7 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm"
          >
            View My Work
          </a>
          <a
            href="#contact"
            className="px-7 py-3 rounded-lg border border-indigo-500/40 text-slate-300 hover:text-white hover:border-cyan-400/60 font-semibold text-sm transition-all duration-200"
          >
            Get In Touch
          </a>
          <a
            href="/resume.pdf"
            download
            className="px-7 py-3 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 font-semibold text-sm transition-all duration-200"
          >
            Resume ↓
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          custom={0.6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center gap-6"
        >
          <a
            href="https://github.com/soominjo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-slate-600 hover:text-indigo-400 transition-colors"
          >
            <GitHubIcon />
          </a>
          <a
            href="https://www.linkedin.com/in/genessis-contreras-28320a375/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-slate-600 hover:text-indigo-400 transition-colors"
          >
            <LinkedInIcon />
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-5 h-9 rounded-full border border-indigo-500/40 flex items-start justify-center p-1.5">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-1.5 rounded-full bg-indigo-400"
          />
        </div>
      </motion.div>
    </section>
  )
}

function GitHubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { Theme } from '../../hooks/useTheme';
import { HeroBackground } from '../backgrounds/HeroBackground';
import { DecoderText } from '../motion/DecoderText';
import { RotatingWords } from '../motion/RotatingWords';

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: EASE },
  }),
};

// Reduced motion: the same entrance as a plain fade, with no sliding.
const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 0.7, delay, ease: EASE },
  }),
};

// The intro column from hamishw.com: centred, text left-aligned inside it.
// 780px wide, 920px above 1680px, 1024px above 2080px.
const TEXT_COLUMN =
  'mx-auto w-full max-w-[780px] min-[1681px]:max-w-[920px] min-[2081px]:max-w-[1024px]';

// The role line cycles through these, in this order.
const ROLES = [
  'Full Stack Developer',
  'QA Engineer',
  'AI Engineer',
  'Software Engineer',
] as const;

interface HeroProps {
  theme: Theme;
}

export function Hero({ theme }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const reveal = reduceMotion ? fadeIn : fadeUp;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg" />

      {/* Gradient blobs */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-175 h-125 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-100 h-100 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)',
        }}
      />

      {/* WebGL background: the galaxy, or a lab candidate in dev and preview builds */}
      <HeroBackground theme={theme} />

      {/* Bottom fade: melts the galaxy into the page colour */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-[#05070f] to-transparent light:from-[#f7f9fc]" />

      {/* Name + rotating role. Vertically centred and nudged up (8% of the
          screen on phones, Hamish's 24px on desktop). On desktop the column is
          centred, and the equal side padding keeps it clear of the side nav. */}
      <div className="relative z-10 flex min-h-screen flex-col justify-center px-6 desk:px-32">
        <div className={`relative top-[-8vh] desk:-top-6 ${TEXT_COLUMN}`}>
          <h1 className="whitespace-nowrap font-display text-[clamp(1.25rem,8vw,3rem)] font-bold leading-none tracking-tight text-white light:text-slate-900 md:text-[clamp(2.25rem,6vw,3.5rem)] lg:text-[clamp(2.5rem,4.6vw,4.75rem)]">
            <motion.span
              custom={0.1}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="inline-block"
            >
              <DecoderText text="Genessis" delayMs={300} />
            </motion.span>{' '}
            <motion.span
              custom={0.2}
              variants={reveal}
              initial="hidden"
              animate="visible"
              className="inline-block glow-text text-indigo-400 light:text-indigo-600"
            >
              <DecoderText text="Contreras" delayMs={1000} />
            </motion.span>
          </h1>

          <motion.p
            custom={0.35}
            variants={reveal}
            initial="hidden"
            animate="visible"
            className="mt-4 font-display text-[clamp(1.25rem,6vw,1.75rem)] font-semibold text-slate-300 light:text-slate-600 md:text-[clamp(1.5rem,3.6vw,2.25rem)] lg:mt-6 lg:text-[clamp(1.5rem,2.6vw,2.75rem)]"
          >
            <RotatingWords words={ROLES} />
          </motion.p>
        </div>
      </div>
    </section>
  );
}

import { MotionConfig, motion, useInView, type Variants } from 'framer-motion'
import { useRef, type MouseEvent } from 'react'
import { isPlainLeftClick, navigate } from '../../hooks/useRoute'
import { SendIcon } from '../contact/ContactIcons'
import { CONTACT_OPEN_FORM_ID } from '../contact/contactIds'
import { ExternalBioLink } from '../contact/ExternalBioLink'
import { HoloPortrait } from '../contact/HoloPortrait'
import { FOCUS_RING } from '../layout/navConfig'
import { DecoderText } from '../motion/DecoderText'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}

const IN_VIEW = { once: true, margin: '-80px' } as const

/**
 * The homepage's closing block, laid out like the "Hi there" section on
 * hamishw.com: who Genessis is on the left, the holo-framed photo on the
 * right, and a link to the /contact form page.
 */
export function Contact() {
  const headingRef = useRef<HTMLHeadingElement>(null)
  // "Hi there" decodes once it scrolls into view, not on page load.
  const headingInView = useInView(headingRef, IN_VIEW)

  const openForm = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (!isPlainLeftClick(event)) return
    event.preventDefault()
    navigate('/contact')
  }

  return (
    <section id="contact" className="relative px-6 py-28 clear-side-nav bg-[#070b14] light:bg-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />

      <MotionConfig reducedMotion="user">
        <div className="mx-auto grid max-w-[1096px] gap-12 lg:grid-cols-[1fr_46%]">
          <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={IN_VIEW}>
            <p className="mb-3 font-mono-label text-xs uppercase tracking-[0.25em] text-indigo-400 light:text-indigo-600">
              {'// get.in.touch'}
            </p>
            <h2
              ref={headingRef}
              className="mb-6 font-display text-3xl font-bold text-white sm:text-[2.375rem] light:text-slate-900"
            >
              {headingInView ? <DecoderText text="Hi there" delayMs={300} /> : 'Hi there'}
            </h2>
            <div className="max-w-[520px] space-y-5 text-lg leading-relaxed text-slate-300 light:text-slate-700">
              <p>
                I&apos;m Genessis, a full-stack developer based in Cavite, Philippines. I got my
                start at Inner SPARC Realty, where I was promoted from intern after building a
                commission monitoring system that 128 people rely on, boosting efficiency by
                30%. At <ExternalBioLink href="https://www.hytel.io/">Hytel</ExternalBioLink>, I
                worked in QA across several enterprise projects before moving into full-stack
                work on <ExternalBioLink href="https://flinki.co/">Flinki</ExternalBioLink>, the
                world&apos;s first AI-powered identity engine for sports and adventure.
              </p>
              <p>
                In my spare time I play video games, hit the gym, and build side projects.
                I&apos;m always open to new opportunities, so feel free to drop me a line.
              </p>
            </div>
            <a
              id={CONTACT_OPEN_FORM_ID}
              href="/contact"
              onClick={openForm}
              className={`group mt-7 inline-flex items-center gap-2.5 font-semibold text-cyan-400 transition-colors hover:text-cyan-300 light:text-cyan-700 light:hover:text-cyan-800 ${FOCUS_RING}`}
            >
              <SendIcon className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
              Send me a message
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={0.1}
            initial="hidden"
            whileInView="visible"
            viewport={IN_VIEW}
            className="lg:pt-32"
          >
            <HoloPortrait />
          </motion.div>
        </div>
      </MotionConfig>
    </section>
  )
}

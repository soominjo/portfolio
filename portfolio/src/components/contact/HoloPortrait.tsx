import portrait640 from '../../assets/portrait-640.webp'
import portrait1100 from '../../assets/portrait.webp'

/**
 * The portrait in the chat terminal's glass frame. The photo is drawn 118%
 * tall from 6% down, so its bottom (which carries a small watermark on the
 * pocket) always stays outside the frame: a head-and-shoulders crop.
 */
export function HoloPortrait() {
  return (
    <div>
      <div aria-hidden="true" className="mb-6 flex items-center gap-3">
        <span className="h-[3px] w-16 rounded-full bg-linear-to-r from-indigo-500 to-cyan-400 light:from-indigo-600 light:to-cyan-600" />
        <span className="font-mono-label text-xs uppercase tracking-[0.2em] text-slate-500">profile.webp</span>
      </div>

      <figure className="chat-terminal relative mx-auto w-full max-w-[440px] lg:mx-0">
        <span aria-hidden="true" className="chat-corner chat-corner--tl" />
        <span aria-hidden="true" className="chat-corner chat-corner--tr" />
        <span aria-hidden="true" className="chat-corner chat-corner--bl" />
        <span aria-hidden="true" className="chat-corner chat-corner--br" />

        <div className="chat-head relative z-10 flex items-center justify-between gap-3 px-3.5 py-2.5 font-mono-label text-[11.5px] text-slate-400 light:text-slate-600">
          <span>~ genessis/profile.webp</span>
          <span className="chat-status">AVAILABLE</span>
        </div>

        <div className="relative h-[380px] overflow-hidden sm:h-[430px]">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_62%,rgba(99,102,241,0.3),transparent_66%)] light:bg-[radial-gradient(ellipse_at_50%_62%,rgba(99,102,241,0.14),transparent_66%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.08)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_50%_55%,#000_30%,transparent_75%)]"
          />
          <img
            src={portrait640}
            srcSet={`${portrait640} 640w, ${portrait1100} 1100w`}
            sizes="(min-width: 1024px) 440px, 90vw"
            width={640}
            height={854}
            alt="Genessis Contreras"
            loading="lazy"
            className="absolute top-[6%] left-1/2 h-[118%] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_0_22px_rgba(34,211,238,0.2)]"
          />
          <div aria-hidden="true" className="chat-scanlines" />
        </div>

        <figcaption className="relative z-10 flex justify-between gap-3 border-t border-cyan-400/18 px-3.5 py-2.5 font-mono-label text-[10.5px] tracking-[0.16em] text-slate-500 light:border-cyan-700/20">
          <span>GENESSIS S. CONTRERAS</span>
          <span>CAVITE · PH</span>
        </figcaption>
      </figure>
    </div>
  )
}

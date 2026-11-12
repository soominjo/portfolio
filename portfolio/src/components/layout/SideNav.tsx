// Layout and spacing adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { FOCUS_RING, LOGO_LABEL, NAV_ICON_CLASS, NAV_LINKS } from './navConfig'
import { SocialLinks } from './SocialLinks'

interface SideNavProps {
  current: string | null
}

/**
 * Desktop side nav, floating with no backing, on Hamish's spacing: a 48px
 * column inset by the outer margin (48px, or 64px above 1680px wide). The
 * logo sits on top, the section links run vertically (reading bottom to top)
 * right under it, and the social links sit at the bottom. Shown only on
 * screens wide and tall enough (`desk`); shorter ones get the phone menu.
 */
export function SideNav({ current }: SideNavProps) {
  return (
    <div
      data-testid="side-rail"
      className="fixed bottom-12 left-12 top-12 z-50 hidden w-12 flex-col items-center desk:flex min-[1681px]:bottom-16 min-[1681px]:left-16 min-[1681px]:top-16"
    >
      <a
        href="#hero"
        aria-label={LOGO_LABEL}
        className={`p-2 pb-6 font-display text-2xl font-bold leading-none tracking-tight text-white transition-colors hover:text-indigo-400 light:text-slate-900 light:hover:text-indigo-600 ${FOCUS_RING}`}
      >
        GC<span className="glow-cyan text-indigo-400 light:text-indigo-600">.</span>
      </a>

      <nav aria-label="Sections" className="flex w-12 flex-1 flex-col items-center justify-between">
        <ul className="flex rotate-180 flex-row-reverse [writing-mode:vertical-lr]">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                aria-current={current === href ? 'location' : undefined}
                className={`group relative inline-flex items-center p-4 text-base font-medium leading-none text-slate-300/80 transition-colors hover:text-white aria-[current=location]:text-white light:text-slate-900/75 light:hover:text-slate-900 light:aria-[current=location]:text-slate-900 ${FOCUS_RING}`}
              >
                {label}
                {/* Physical top/bottom on purpose: Tailwind's inset-y is logical
                    (inset-block), which runs sideways in vertical writing mode.
                    left-1/2 + translate centres it without relying on how each
                    engine places absolutely positioned items in vertical text. */}
                <span
                  aria-hidden="true"
                  className="absolute top-2 bottom-2 left-1/2 w-1 -translate-x-1/2 origin-bottom scale-y-0 bg-cyan-400 transition-transform duration-400 ease-in-out group-hover:origin-top group-hover:scale-y-100 group-focus-visible:scale-y-100 group-aria-[current=location]:scale-y-100 light:bg-cyan-600"
                />
              </a>
            </li>
          ))}
        </ul>

        <SocialLinks className="flex flex-col items-center" itemClassName={NAV_ICON_CLASS} />
      </nav>
    </div>
  )
}

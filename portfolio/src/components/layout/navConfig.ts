export interface NavLink {
  readonly label: string
  readonly href: string
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Projects', href: '#projects' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

// Stable reference for useActiveSection's effect dependency.
export const NAV_HREFS: readonly string[] = NAV_LINKS.map((link) => link.href)

export const RESUME_HREF = '/resume'

// Starts with the visible "GC" so voice-control users can say what they see.
export const LOGO_LABEL = 'GC, Genessis Contreras, back to top'

// Visible keyboard focus for every nav control.
export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400'

// 44px square hit area for the icon controls in the phone bar and phone menu.
export const ICON_BUTTON_CLASS = `flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 light:text-slate-600 hover:text-cyan-400 light:hover:text-cyan-700 hover:bg-white/5 light:hover:bg-slate-900/5 transition-colors ${FOCUS_RING}`

// Side-nav icon links: Hamish's 48px boxes with 8px padding, colour-only hover.
export const NAV_ICON_CLASS = `flex h-12 w-12 items-center justify-center p-2 text-slate-400 transition-colors hover:text-cyan-400 light:text-slate-500 light:hover:text-cyan-700 [&>svg]:size-5 ${FOCUS_RING}`

// Theme toggle in the desktop corner: Hamish's 56px icon button holding the 38px sun/moon icon,
// on a soft see-through disc so it stays readable when it floats over page content.
export const CORNER_TOGGLE_CLASS = `flex h-14 w-14 items-center justify-center rounded-full bg-[#05070f]/55 backdrop-blur-md light:bg-white/65 text-slate-300 transition-colors hover:text-cyan-400 light:text-slate-800 light:hover:text-cyan-700 ${FOCUS_RING}`

export const NAV_EASE = [0.22, 1, 0.36, 1] as const

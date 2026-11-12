import type { MouseEvent } from 'react'
import { useActiveSection } from '../../hooks/useActiveSection'
import type { Theme } from '../../hooks/useTheme'
import { MobileNav } from './MobileNav'
import { CORNER_TOGGLE_CLASS, NAV_HREFS } from './navConfig'
import { SideNav } from './SideNav'
import { ThemeToggle } from './ThemeToggle'

interface NavbarProps {
  theme: Theme
  onToggleTheme: (event: MouseEvent<HTMLButtonElement>) => void
}

/**
 * Screens wide and tall enough (`desk`) get the floating side nav and a theme
 * toggle in the top-right corner, inset like Hamish's (outer margin minus 6px).
 * Everything else, short laptops and landscape phones included, gets the top
 * bar and slide-down menu. The current link follows the section in view.
 */
export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const current = useActiveSection(NAV_HREFS)

  return (
    <header>
      <SideNav current={current} />
      <div
        data-testid="corner-controls"
        className="fixed right-[42px] top-[42px] z-50 hidden desk:block min-[1681px]:right-[58px] min-[1681px]:top-[58px]"
      >
        <ThemeToggle theme={theme} onToggle={onToggleTheme} className={CORNER_TOGGLE_CLASS} />
      </div>
      <MobileNav theme={theme} onToggleTheme={onToggleTheme} current={current} />
    </header>
  )
}

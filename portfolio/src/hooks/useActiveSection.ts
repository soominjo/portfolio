import { useEffect, useState } from 'react'

// A line across the middle of the viewport; the section crossing it is current.
const VIEWPORT_MIDLINE = '-50% 0px -50% 0px'

/**
 * Tracks which section is in view. Returns the href ('#id') of the section
 * crossing the middle of the viewport, or null when none does (for example
 * while the hero is in view). When nested sections both cross it, the one
 * listed later in `hrefs` wins, so #experience beats the #about it sits in.
 */
export function useActiveSection(hrefs: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const crossing = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const href = `#${entry.target.id}`
          if (entry.isIntersecting) crossing.add(href)
          else crossing.delete(href)
        }
        setActive(hrefs.findLast((href) => crossing.has(href)) ?? null)
      },
      { rootMargin: VIEWPORT_MIDLINE },
    )

    for (const href of hrefs) {
      const section = document.getElementById(href.slice(1))
      if (section) observer.observe(section)
    }

    return () => observer.disconnect()
  }, [hrefs])

  return active
}

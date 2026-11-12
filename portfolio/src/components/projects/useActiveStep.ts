import { useEffect, useState } from 'react'

// A line across the middle of the viewport; the step crossing it is active.
export const STEP_MIDLINE = '-50% 0px -50% 0px'

/** The latest step crossing the midline, or `previous` when none is. */
export function nextActiveStep(previous: number, crossing: ReadonlySet<number>): number {
  return crossing.size === 0 ? previous : Math.max(...crossing)
}

/**
 * Index of the scroll step crossing the middle of the viewport. Each id names
 * an element (one per step) stacked down a scroll track. Starts at 0 and keeps
 * the last value while no step crosses, e.g. before the track is reached.
 * Pass a stable array: a new one re-observes every step.
 */
export function useActiveStep(stepIds: readonly string[]): number {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const crossing = new Set<number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = stepIds.indexOf(entry.target.id)
          if (index === -1) continue
          if (entry.isIntersecting) crossing.add(index)
          else crossing.delete(index)
        }
        setActive((previous) => nextActiveStep(previous, crossing))
      },
      { rootMargin: STEP_MIDLINE },
    )

    for (const id of stepIds) {
      const step = document.getElementById(id)
      if (step) observer.observe(step)
    }

    return () => observer.disconnect()
  }, [stepIds])

  return active
}

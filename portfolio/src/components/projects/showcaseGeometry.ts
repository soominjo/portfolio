// Scroll geometry of the pinned showcase, in svh. A project takes over when
// its step reaches the middle of the viewport, so the steps start half a
// screen down and the last one runs half a screen long: that way the first
// and last projects stay pinned as long as the rest.
export const STAGE_SVH = 100
const MIDLINE_SVH = 50
export const STEP_SVH = 75
/** Where the first step starts, measured down from the top of the track. */
export const LEAD_SVH = 50
export const LAST_STEP_SVH = 125

// Tailwind needs literal class names; a test keeps these in step with the numbers above.
export const STEP_CLASS = 'h-[75svh]'
export const LAST_STEP_CLASS = 'h-[125svh]'
/** Pulls the steps up under the stage so the first starts LEAD_SVH below the track top. */
export const TRACK_OFFSET_CLASS = '-mt-[50svh]'

/** How far, in svh of scrolling, each project stays on the pinned stage. */
export function pinnedDwell(count: number): number[] {
  // Project i takes over when its step reaches the middle of the viewport.
  const takeoverAt = (i: number) => LEAD_SVH + i * STEP_SVH - MIDLINE_SVH
  const trackHeight = LEAD_SVH + (count - 1) * STEP_SVH + LAST_STEP_SVH
  const releaseAt = trackHeight - STAGE_SVH
  return Array.from({ length: count }, (_, i) => {
    const end = i + 1 < count ? Math.min(takeoverAt(i + 1), releaseAt) : releaseAt
    return end - Math.max(takeoverAt(i), 0)
  })
}

import { useReducedMotion } from 'framer-motion'
import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import type { Project } from '../../../../shared/types/project'
import { DecorativeBoundary } from '../DecorativeBoundary'
import { toDeviceSlide } from './deviceSlides'
import { ProgressRail } from './ProgressRail'
import { ProjectDetailsDialog } from './ProjectDetailsDialog'
import { ProjectPanel } from './ProjectPanel'
import { ScreenshotFallback } from './ScreenshotFallback'
import { LAST_STEP_CLASS, STEP_CLASS, TRACK_OFFSET_CLASS } from './showcaseGeometry'
import { groupShowcase, orderForShowcase } from './showcaseOrder'
import { StageBackground } from './StageBackground'
import { useActiveStep } from './useActiveStep'
import { useViewportFit, type ViewportFit } from './useViewportFit'

// three.js is heavy, so the devices arrive in their own chunk.
const DeviceStage = lazy(() => import('../three/devices/DeviceStage'))

export const STEP_PREFIX = 'project-step-'

// Short screens shrink the devices and pull the rail down; very short ones
// (phones held sideways) drop the devices and the rail so the text fits.
const STAGE_PADDING: Readonly<Record<ViewportFit, string>> = { regular: 'pb-20', compact: 'pb-14', tiny: 'pb-4' }
const DEVICE_CELL: Readonly<Record<ViewportFit, string>> = { regular: 'h-[40%]', compact: 'h-[28%]', tiny: 'hidden lg:block' }
const RAIL_PLACEMENT: Readonly<Record<ViewportFit, string>> = { regular: 'bottom-6', compact: 'bottom-3', tiny: 'hidden' }

interface ProjectShowcaseProps {
  readonly projects: readonly Project[]
}

/** One invisible step per project, pulled up under the stage. */
function ScrollSteps({ stepIds }: { readonly stepIds: readonly string[] }) {
  return (
    <div aria-hidden="true" className={TRACK_OFFSET_CLASS}>
      {stepIds.map((id, index) => (
        <div key={id} id={id} className={index === stepIds.length - 1 ? LAST_STEP_CLASS : STEP_CLASS} />
      ))}
    </div>
  )
}

/**
 * The projects as a pinned scroll: a full-height stage sticks while one
 * invisible step per project scrolls past behind it, and the step crossing
 * the middle of the viewport picks the project on show.
 */
export function ProjectShowcase({ projects }: ProjectShowcaseProps) {
  const ordered = useMemo(() => orderForShowcase(projects), [projects])
  const groups = useMemo(() => groupShowcase(ordered), [ordered])
  const slides = useMemo(() => ordered.map(toDeviceSlide), [ordered])
  const titles = useMemo(() => ordered.map((project) => project.title), [ordered])
  const stepIds = useMemo(() => ordered.map((project) => STEP_PREFIX + project.id), [ordered])
  const active = useActiveStep(stepIds)
  const fit = useViewportFit()
  const reduceMotion = useReducedMotion() ?? false
  const [details, setDetails] = useState<Project | null>(null)

  const scrollToStep = useCallback(
    (index: number, behavior: ScrollBehavior) => {
      document.getElementById(stepIds[index])?.scrollIntoView({ block: 'start', behavior })
    },
    [stepIds],
  )
  // Rail clicks glide; keyboard focus jumps, so the focused panel is on screen at once.
  const glideTo = useCallback((index: number) => scrollToStep(index, reduceMotion ? 'instant' : 'smooth'), [scrollToStep, reduceMotion])
  const jumpTo = useCallback((index: number) => scrollToStep(index, 'instant'), [scrollToStep])

  const activeSlide = slides[active]

  return (
    <div className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        <StageBackground />
        <div
          className={`clear-side-nav relative mx-auto flex h-full max-w-[88rem] flex-col px-6 pt-16 desk:pt-0 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-8 lg:pb-0 ${STAGE_PADDING[fit]}`}
        >
          <div data-testid="device-cell" className={`relative order-1 shrink-0 lg:order-2 lg:h-[78%] ${DEVICE_CELL[fit]}`}>
            <DecorativeBoundary>
              <Suspense fallback={null}>
                <DeviceStage
                  slides={slides}
                  activeIndex={active}
                  fallback={activeSlide ? <ScreenshotFallback slide={activeSlide} /> : null}
                  className="absolute inset-0"
                />
              </Suspense>
            </DecorativeBoundary>
          </div>

          <ol role="list" aria-label="Projects" className="relative order-2 min-h-0 flex-1 lg:order-1 lg:h-[70%]">
            {ordered.map((project, index) => (
              <li key={project.id} className="pointer-events-none absolute inset-0 flex items-start pt-4 lg:items-center lg:pt-0">
                <ProjectPanel
                  project={project}
                  index={index}
                  total={ordered.length}
                  active={index === active}
                  fit={fit}
                  onOpenDetails={setDetails}
                  onFocusInactive={jumpTo}
                />
              </li>
            ))}
          </ol>

          <ProgressRail
            groups={groups}
            titles={titles}
            active={active}
            onJump={glideTo}
            className={`absolute left-6 desk:left-32 lg:bottom-10 ${RAIL_PLACEMENT[fit]}`}
          />
        </div>
      </div>

      <ScrollSteps stepIds={stepIds} />
      <ProjectDetailsDialog project={details} onClose={() => setDetails(null)} />
    </div>
  )
}

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'

export type SkillState = 'rest' | 'active' | 'dimmed'

export interface SkillHandlers {
  readonly onPointerEnter: (event: PointerEvent<HTMLElement>) => void
  readonly onPointerLeave: (event: PointerEvent<HTMLElement>) => void
  readonly onPointerDown: (event: PointerEvent<HTMLElement>) => void
  readonly onClick: () => void
}

export interface ActiveSkillApi {
  /** Pointer handlers for one skill element. */
  readonly handlersFor: (row: string, name: string) => SkillHandlers
  /** Whether a skill is highlighted, dimmed beside the highlight, or neither. */
  readonly stateOf: (row: string, name: string) => SkillState
  /** Drops any highlight, e.g. when the skills re-render under a pointer that never left. */
  readonly clear: () => void
}

interface ActiveSkill {
  readonly row: string
  readonly name: string
}

/**
 * How long a skill stays highlighted after the mouse leaves it. Crossing the
 * small gap to a neighbour takes less than this, so the row doesn't flash.
 */
export const LEAVE_DELAY_MS = 90

/** Every skill element carries this attribute, so a tap outside them can be detected. */
export const SKILL_ATTRIBUTE = 'data-skill'

function isSkill(active: ActiveSkill | null, row: string, name: string): boolean {
  return active !== null && active.row === row && active.name === name
}

/**
 * Tracks the one skill being looked at. A mouse highlights a skill while it
 * hovers. Touch and pen toggle it with a tap instead; pen hover is ignored,
 * so a pen's hover can never undo its own tap. Escape, or a tap outside every
 * skill, clears it.
 */
export function useActiveSkill(): ActiveSkillApi {
  const [active, setActive] = useState<ActiveSkill | null>(null)
  const leaveTimer = useRef<number | undefined>(undefined)
  const lastPointerType = useRef('mouse')

  const cancelLeave = useCallback(() => {
    window.clearTimeout(leaveTimer.current)
    leaveTimer.current = undefined
  }, [])

  useEffect(() => cancelLeave, [cancelLeave])

  const clear = useCallback(() => {
    cancelLeave()
    setActive(null)
  }, [cancelLeave])

  useEffect(() => {
    if (!active) return undefined

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const { target } = event
      if (target instanceof Element && target.closest(`[${SKILL_ATTRIBUTE}]`)) return
      setActive(null)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [active])

  const handlersFor = useCallback(
    (row: string, name: string): SkillHandlers => ({
      onPointerEnter: (event) => {
        if (event.pointerType !== 'mouse') return
        cancelLeave()
        setActive((current) => (isSkill(current, row, name) ? current : { row, name }))
      },
      onPointerLeave: (event) => {
        if (event.pointerType !== 'mouse') return
        cancelLeave()
        leaveTimer.current = window.setTimeout(() => {
          leaveTimer.current = undefined
          setActive((current) => (isSkill(current, row, name) ? null : current))
        }, LEAVE_DELAY_MS)
      },
      onPointerDown: (event) => {
        lastPointerType.current = event.pointerType
      },
      onClick: () => {
        if (lastPointerType.current === 'mouse') return
        cancelLeave()
        setActive((current) => (isSkill(current, row, name) ? null : { row, name }))
      },
    }),
    [cancelLeave],
  )

  const stateOf = useCallback(
    (row: string, name: string): SkillState => {
      if (!active || active.row !== row) return 'rest'
      return active.name === name ? 'active' : 'dimmed'
    },
    [active],
  )

  return { handlersFor, stateOf, clear }
}

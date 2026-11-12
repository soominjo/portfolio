import { useCallback, useRef, useState, type FocusEvent } from 'react'

export interface EngagementHandlers {
  onPointerEnter(): void
  onPointerLeave(): void
  onPointerDown(): void
  onKeyDown(): void
  onFocus(): void
  onBlur(event: FocusEvent<HTMLElement>): void
}

export interface Engagement {
  readonly engaged: boolean
  readonly hovered: boolean
  readonly handlers: EngagementHandlers
  /** Moves focus without counting it as the visitor engaging. */
  focusQuietly(element: HTMLElement | null): void
}

/**
 * Whether the visitor is using the panel (typing, pressing or moving focus
 * into it) and whether the pointer is over it. Focus the panel places itself,
 * such as the input on open, doesn't count, so the panel keeps its tilt until
 * the visitor actually engages.
 */
export function useEngagement(): Engagement {
  const [engaged, setEngaged] = useState(false)
  const [hovered, setHovered] = useState(false)
  const quietFocusRef = useRef(false)

  const focusQuietly = useCallback((element: HTMLElement | null) => {
    if (!element) return
    quietFocusRef.current = true
    try {
      // Focus events fire synchronously, so onFocus sees the flag.
      element.focus()
    } finally {
      quietFocusRef.current = false
    }
  }, [])

  const engage = () => setEngaged(true)

  return {
    engaged,
    hovered,
    focusQuietly,
    handlers: {
      onPointerEnter: () => setHovered(true),
      onPointerLeave: () => setHovered(false),
      onPointerDown: engage,
      onKeyDown: engage,
      onFocus: () => {
        if (!quietFocusRef.current) engage()
      },
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setEngaged(false)
      },
    },
  }
}

import { useCallback, useState } from 'react'
import { type BackgroundId, DEFAULT_BACKGROUND, parseBackgroundId, withBackgroundParam } from './backgroundLab'

type BackgroundChoice = readonly [BackgroundId, (id: BackgroundId) => void]

/**
 * The hero background picked in the lab. It lives in the `?bg=` query param,
 * so a reload or a shared preview link shows the same one. Outside the lab
 * it is always the default and the URL is never read.
 */
export function useBackgroundChoice(labEnabled: boolean): BackgroundChoice {
  const [choice, setChoice] = useState<BackgroundId>(() =>
    labEnabled ? parseBackgroundId(window.location.search) : DEFAULT_BACKGROUND,
  )

  const choose = useCallback((id: BackgroundId) => {
    setChoice(id)
    const url = new URL(window.location.href)
    url.search = withBackgroundParam(url.search, id)
    window.history.replaceState(window.history.state, '', url)
  }, [])

  return [choice, choose]
}

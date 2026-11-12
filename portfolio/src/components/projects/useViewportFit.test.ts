import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { mockMediaQueries } from './testProjects'
import { COMPACT_QUERY, TINY_QUERY, useViewportFit, viewportFit } from './useViewportFit'

describe('viewportFit', () => {
  it.each([
    [false, false, 'regular'],
    [true, false, 'compact'],
    [true, true, 'tiny'],
  ] as const)('compact %s, tiny %s → %s', (compact, tiny, fit) => {
    expect(viewportFit(compact, tiny)).toBe(fit)
  })
})

describe('useViewportFit', () => {
  let media: ReturnType<typeof mockMediaQueries> | null = null

  afterEach(() => {
    media?.restore()
    media = null
  })

  it('assumes a regular screen when the browser cannot say', () => {
    expect(renderHook(() => useViewportFit()).result.current).toBe('regular')
  })

  it('reads the height media queries', () => {
    media = mockMediaQueries({ [COMPACT_QUERY]: true })
    expect(renderHook(() => useViewportFit()).result.current).toBe('compact')
  })

  it('follows the window when its height changes', () => {
    media = mockMediaQueries({})
    const { result } = renderHook(() => useViewportFit())
    act(() => media?.change({ [COMPACT_QUERY]: true, [TINY_QUERY]: true }))
    expect(result.current).toBe('tiny')
  })
})

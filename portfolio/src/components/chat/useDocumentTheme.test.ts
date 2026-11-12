import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useDocumentTheme } from './useDocumentTheme'

describe('useDocumentTheme', () => {
  afterEach(() => {
    document.documentElement.classList.remove('light')
  })

  it('reads dark by default', () => {
    expect(renderHook(() => useDocumentTheme()).result.current).toBe('dark')
  })

  it('follows the light class on <html>', async () => {
    const { result } = renderHook(() => useDocumentTheme())
    act(() => document.documentElement.classList.add('light'))
    await waitFor(() => expect(result.current).toBe('light'))
  })
})

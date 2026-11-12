import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { reducedMotion } from '../../test/controls'
import { Hero } from './Hero'

// The two inline-block spans inside the h1: the first name and the surname.
function nameParts(): HTMLElement[] {
  return Array.from(
    screen.getByRole('heading', { level: 1 }).querySelectorAll<HTMLElement>(':scope > span'),
  )
}

const sphereModule = vi.hoisted(() => ({ fail: false }))

// The sphere has its own tests and needs WebGL; here the hero only places it.
vi.mock('../three/DisplacementSphere', () => ({
  default: () => {
    if (sphereModule.fail) throw new Error('sphere chunk failed to load')
    return null
  },
}))

describe('Hero', () => {
  afterEach(() => {
    sphereModule.fail = false
    vi.restoreAllMocks()
  })

  it('keeps the page when the sphere fails to load', async () => {
    sphereModule.fail = true
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<Hero theme="dark" />)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(consoleError).toHaveBeenCalled()
    expect(screen.getByRole('heading', { level: 1, name: 'Genessis Contreras' })).toBeInTheDocument()
  })

  it('renders the name as one level-one heading', () => {
    render(<Hero theme="dark" />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1, name: 'Genessis Contreras' })).toBeInTheDocument()
  })

  it('lists every role for assistive tech', () => {
    render(<Hero theme="dark" />)
    expect(
      screen.getByText('Full Stack Developer, QA Engineer, AI Engineer, and Software Engineer'),
    ).toHaveClass('sr-only')
  })

  it('leaves the photo out for now', () => {
    render(<Hero theme="dark" />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('colours the surname per theme, darker on the light page for contrast', () => {
    render(<Hero theme="dark" />)
    const surname = nameParts()[1]
    // An inline colour can't be overridden by the light theme, so it must come from classes.
    expect(surname.style.color).toBe('')
    expect(surname).toHaveClass('text-indigo-400', 'light:text-indigo-600')
  })

  it('keeps the hero still when reduced motion is preferred', async () => {
    reducedMotion.value = true
    render(<Hero theme="dark" />)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150))
    })
    expect(nameParts()[0].style.transform).not.toContain('translateY')
    expect(screen.getByTestId('scroll-indicator-dot').style.transform).not.toContain('translateY')
  })
})

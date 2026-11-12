import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { DeviceSlide } from '../three/devices/deviceTypes'
import { ScreenshotFallback } from './ScreenshotFallback'

const SLIDE: DeviceSlide = {
  id: 'flinki',
  label: 'Flinki',
  desktopUrl: '/projects/flinki.webp',
  mobileUrl: null,
  showPhone: true,
  finish: 'silver',
  desktopFocusX: 0.5,
}

describe('ScreenshotFallback', () => {
  it('shows the desktop screenshot when the 3D devices cannot', () => {
    render(<ScreenshotFallback slide={SLIDE} />)
    expect(screen.getByAltText('Flinki on desktop')).toHaveAttribute('src', '/projects/flinki.webp')
  })

  it('shows nothing when the project has no desktop screenshot', () => {
    const { container } = render(<ScreenshotFallback slide={{ ...SLIDE, desktopUrl: null }} />)
    expect(container).toBeEmptyDOMElement()
  })
})

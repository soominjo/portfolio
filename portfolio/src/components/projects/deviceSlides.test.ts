import { describe, expect, it } from 'vitest'
import { toDeviceSlide } from './deviceSlides'
import { ENGINEERING_PROJECT } from './testProjects'

describe('toDeviceSlide', () => {
  it('maps a project to what the devices show', () => {
    expect(toDeviceSlide(ENGINEERING_PROJECT)).toEqual({
      id: 'flinki',
      label: 'Flinki',
      desktopUrl: '/projects/flinki.webp',
      mobileUrl: '/projects/flinki-mobile.webp',
      showPhone: true,
      finish: 'silver',
      desktopFocusX: 0.5,
    })
  })

  it("passes on where the project's screenshot should be cropped", () => {
    expect(toDeviceSlide({ ...ENGINEERING_PROJECT, screenFocusX: 0 }).desktopFocusX).toBe(0)
  })

  it('uses null for screenshots the project lacks', () => {
    const slide = toDeviceSlide({ ...ENGINEERING_PROJECT, imageUrl: undefined, mobileImageUrl: undefined, showPhone: false })
    expect(slide).toMatchObject({ desktopUrl: null, mobileUrl: null, showPhone: false })
  })
})

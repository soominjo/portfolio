import type { Project } from '../../../../shared/types/project'
import type { DeviceSlide } from '../three/devices/deviceTypes'

const CENTRE = 0.5

/** What the showcase devices should display for a project. */
export function toDeviceSlide(project: Project): DeviceSlide {
  return {
    id: project.id,
    label: project.title,
    desktopUrl: project.imageUrl ?? null,
    mobileUrl: project.mobileImageUrl ?? null,
    showPhone: project.showPhone,
    finish: project.deviceFinish,
    desktopFocusX: project.screenFocusX ?? CENTRE,
  }
}

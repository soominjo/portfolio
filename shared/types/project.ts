export type ProjectCategory = 'engineering' | 'qa'

/** Distinguishes side projects from work delivered for an employer or client. */
export type ProjectType = 'personal' | 'professional'

/** Colour of the laptop and phone a project is shown on in the showcase. */
export type DeviceFinish = 'silver' | 'black' | 'white'

export interface Project {
  id: string
  title: string
  /** One sentence shown under the title in the projects showcase. */
  tagline: string
  purpose: string
  techStack: string[]
  role: string
  category: ProjectCategory
  type: ProjectType
  /** Desktop screenshot, shown on the showcase laptop. */
  imageUrl?: string
  /**
   * Which part of the desktop screenshot the 16:10 laptop screen keeps when the
   * shot is wider: 0 the left edge, 1 the right edge. Defaults to the centre.
   */
  screenFocusX?: number
  /** Phone screenshot, shown on the showcase phone. */
  mobileImageUrl?: string
  /** Whether the showcase stands a phone beside the laptop. */
  showPhone: boolean
  deviceFinish: DeviceFinish
  order: number
  isFeatured: boolean
}

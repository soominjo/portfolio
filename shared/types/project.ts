export type ProjectCategory = 'engineering' | 'qa'

/** Distinguishes side projects from work delivered for an employer or client. */
export type ProjectType = 'personal' | 'professional'

export interface Project {
  id: string
  title: string
  purpose: string
  techStack: string[]
  role: string
  category: ProjectCategory
  type: ProjectType
  imageUrl?: string
  order: number
  isFeatured: boolean
}

export type ProjectCategory = 'engineering' | 'qa'

export interface Project {
  id: string
  title: string
  purpose: string
  techStack: string[]
  role: string
  category: ProjectCategory
  liveUrl?: string
  githubUrl?: string
  imageUrl?: string
  order: number
  isFeatured: boolean
}

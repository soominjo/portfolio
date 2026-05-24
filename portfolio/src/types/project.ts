export interface Project {
  id: string
  title: string
  purpose: string
  techStack: string[]
  role: string
  liveUrl?: string
  githubUrl?: string
  imageUrl?: string
  order: number
  isFeatured: boolean
}

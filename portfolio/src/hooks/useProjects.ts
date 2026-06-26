import { featuredProjects } from '../data/projects'
import type { Project } from '../types/project'

interface UseProjectsResult {
  projects: Project[]
  loading: boolean
  error: string | null
}

export function useProjects(): UseProjectsResult {
  return {
    projects: featuredProjects,
    loading: false,
    error: null,
  }
}

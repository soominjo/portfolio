import { featuredProjects } from '../../../shared/data/projects'
import type { Project } from '../../../shared/types/project'

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

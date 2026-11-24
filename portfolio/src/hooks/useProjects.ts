import { featuredProjects } from '../../../shared/data/projects'
import type { Project } from '../../../shared/types/project'

interface UseProjectsResult {
  projects: Project[]
}

export function useProjects(): UseProjectsResult {
  return { projects: featuredProjects }
}

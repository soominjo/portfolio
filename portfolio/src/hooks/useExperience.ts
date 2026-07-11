import { experience } from '../../../shared/data/experience'
import type { Experience as ExperienceEntry } from '../../../shared/types/experience'

interface UseExperienceResult {
  experience: ExperienceEntry[]
}

export function useExperience(): UseExperienceResult {
  return { experience }
}

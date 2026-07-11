import { experience } from '../data/experience'
import type { Experience as ExperienceEntry } from '../types/experience'

interface UseExperienceResult {
  experience: ExperienceEntry[]
}

export function useExperience(): UseExperienceResult {
  return { experience }
}

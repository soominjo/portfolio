import type { Project, ProjectCategory } from '../../../../shared/types/project'

/** Categories in the order the showcase plays them. */
const CATEGORY_ORDER: readonly ProjectCategory[] = ['engineering', 'qa']

export const CATEGORY_LABELS: Readonly<Record<ProjectCategory, string>> = {
  engineering: 'Engineering',
  qa: 'QA Engineering',
}

/** A run of consecutive showcase projects in one category; `end` is exclusive. */
export interface ShowcaseGroup {
  readonly category: ProjectCategory
  readonly label: string
  readonly start: number
  readonly end: number
}

/** Engineering projects first, then QA, each sorted by `order`. Returns a new array. */
export function orderForShowcase(projects: readonly Project[]): Project[] {
  return CATEGORY_ORDER.flatMap((category) =>
    projects.filter((p) => p.category === category).sort((a, b) => a.order - b.order),
  )
}

/** Where each category's projects start and end in an already ordered list. */
export function groupShowcase(ordered: readonly Project[]): ShowcaseGroup[] {
  return CATEGORY_ORDER.flatMap((category) => {
    const start = ordered.findIndex((p) => p.category === category)
    if (start === -1) return []
    const count = ordered.filter((p) => p.category === category).length
    return [{ category, label: CATEGORY_LABELS[category], start, end: start + count }]
  })
}

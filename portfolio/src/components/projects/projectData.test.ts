import { describe, expect, it } from 'vitest'
import { featuredProjects } from '../../../../shared/data/projects'
import type { Project } from '../../../../shared/types/project'
import { groupShowcase, orderForShowcase } from './showcaseOrder'

// The order the user asked for on 2026-11-10.
const SHOWCASE_IDS = [
  'flinki',
  'commission-monitoring-system',
  'unwnd-cafe',
  'leads-management-system',
  'maneho-ai',
  'flux-fitness-tracker',
  'cadpractice',
  'switchboard',
  'tms',
  'mythica',
  'reviva',
]

type FixtureFields = Partial<Project> & Pick<Project, 'id' | 'category' | 'order'>

function fixture(fields: FixtureFields): Project {
  return {
    title: fields.id,
    tagline: 'A tagline long enough to pass.',
    purpose: 'Purpose.',
    techStack: [],
    role: 'Developer',
    type: 'personal',
    showPhone: true,
    deviceFinish: 'silver',
    isFeatured: true,
    ...fields,
  }
}

// A lazy glob lists the images under public/ without importing any of them.
// (node:fs would fail the app type-check, which covers test files too.)
const PUBLIC_FILES = new Set(Object.keys(import.meta.glob('/public/**/*.{webp,png,jpg,jpeg}')))

function publicFileExists(url: string): boolean {
  return PUBLIC_FILES.has(`/public${url}`)
}

describe('orderForShowcase', () => {
  const shuffled = [
    fixture({ id: 'q2', category: 'qa', order: 2 }),
    fixture({ id: 'e2', category: 'engineering', order: 2 }),
    fixture({ id: 'q1', category: 'qa', order: 1 }),
    fixture({ id: 'e1', category: 'engineering', order: 1 }),
  ]

  it('puts engineering before QA and sorts each by order', () => {
    expect(orderForShowcase(shuffled).map((p) => p.id)).toEqual(['e1', 'e2', 'q1', 'q2'])
  })

  it('leaves the array it is given untouched', () => {
    orderForShowcase(shuffled)
    expect(shuffled.map((p) => p.id)).toEqual(['q2', 'e2', 'q1', 'e1'])
  })
})

describe('groupShowcase', () => {
  it('reports where each category starts and ends', () => {
    const ordered = [
      fixture({ id: 'e1', category: 'engineering', order: 1 }),
      fixture({ id: 'e2', category: 'engineering', order: 2 }),
      fixture({ id: 'q1', category: 'qa', order: 1 }),
    ]
    expect(groupShowcase(ordered)).toEqual([
      { category: 'engineering', label: 'Engineering', start: 0, end: 2 },
      { category: 'qa', label: 'QA Engineering', start: 2, end: 3 },
    ])
  })

  it('leaves out a category with no projects', () => {
    const ordered = [fixture({ id: 'q1', category: 'qa', order: 1 })]
    expect(groupShowcase(ordered)).toEqual([{ category: 'qa', label: 'QA Engineering', start: 0, end: 1 }])
  })
})

describe('project data', () => {
  const ordered = orderForShowcase(featuredProjects)

  it('follows the agreed showcase order', () => {
    expect(ordered.map((p) => p.id)).toEqual(SHOWCASE_IDS)
  })

  it('gives every project a one-line tagline', () => {
    for (const project of featuredProjects) {
      expect(project.tagline, project.id).not.toMatch(/\n/)
      expect(project.tagline.length, project.id).toBeGreaterThanOrEqual(20)
      expect(project.tagline.length, project.id).toBeLessThanOrEqual(90)
    }
  })

  it('shows a phone for every project except CMS and Leads', () => {
    const withoutPhone = featuredProjects.filter((p) => !p.showPhone).map((p) => p.id)
    expect(withoutPhone.sort()).toEqual(['commission-monitoring-system', 'leads-management-system'])
  })

  it('never puts the same finish on neighbouring projects', () => {
    ordered.slice(1).forEach((project, i) => {
      expect(project.deviceFinish, project.id).not.toBe(ordered[i].deviceFinish)
    })
  })

  it('keeps every screenshot crop focus between the left and right edges', () => {
    for (const project of featuredProjects) {
      const focus = project.screenFocusX ?? 0.5
      expect(focus, project.id).toBeGreaterThanOrEqual(0)
      expect(focus, project.id).toBeLessThanOrEqual(1)
    }
  })

  it('gives mobile screenshots only to projects that show a phone', () => {
    const misplaced = featuredProjects.filter((p) => p.mobileImageUrl && !p.showPhone).map((p) => p.id)
    expect(misplaced).toEqual([])
  })

  it('points every screenshot at a file in public/', () => {
    const urls = featuredProjects.flatMap((p) => [p.imageUrl, p.mobileImageUrl]).filter((url) => url !== undefined)
    expect(urls.length).toBeGreaterThan(featuredProjects.length)
    for (const url of urls) {
      expect(publicFileExists(url), url).toBe(true)
    }
  })
})

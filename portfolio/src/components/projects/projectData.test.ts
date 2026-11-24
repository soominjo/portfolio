import { describe, expect, it } from 'vitest'
import { featuredProjects } from '../../../../shared/data/projects'
import type { Project, ProjectType } from '../../../../shared/types/project'
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

// The live sites the user listed on 2026-11-15. CMS and Leads have none, and
// TMS sits behind a company login, so it has none either.
const LIVE_URLS: Readonly<Record<string, string>> = {
  flinki: 'https://flinki.co/',
  'unwnd-cafe': 'https://unwnd-cafe.vercel.app/',
  'maneho-ai': 'https://maneho-ai.web.app/',
  'flux-fitness-tracker': 'https://flux-59eeb.web.app/',
  cadpractice: 'https://www.cadpractice.com/',
  switchboard: 'https://www.switchboardpm.ai/',
  mythica: 'https://exploremythica.org/',
  reviva: 'https://reviva-dev-9b77d.web.app/',
}

// Internal systems ran inside an employer; external projects were built for a
// client or the public; personal ones are side projects.
const PROJECT_TYPES: Readonly<Record<string, ProjectType>> = {
  flinki: 'external',
  'commission-monitoring-system': 'internal',
  'unwnd-cafe': 'external',
  'leads-management-system': 'internal',
  'maneho-ai': 'personal',
  'flux-fitness-tracker': 'personal',
  cadpractice: 'external',
  switchboard: 'external',
  tms: 'internal',
  mythica: 'external',
  reviva: 'external',
}

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

  it('marks every project as an internal system, an external project or a personal one', () => {
    expect(Object.fromEntries(featuredProjects.map((p) => [p.id, p.type]))).toEqual(PROJECT_TYPES)
  })

  it('describes the product in QA taglines, since the role already says QA', () => {
    for (const project of featuredProjects.filter((p) => p.category === 'qa')) {
      expect(project.tagline, project.id).not.toMatch(/\bQA\b/)
    }
  })

  it('links each project to the live site the user gave, and no others', () => {
    const linked = Object.fromEntries(featuredProjects.filter((p) => p.liveUrl).map((p) => [p.id, p.liveUrl]))
    expect(linked).toEqual(LIVE_URLS)
  })

  it('points every screenshot at a file in public/', () => {
    const urls = featuredProjects.flatMap((p) => [p.imageUrl, p.mobileImageUrl]).filter((url) => url !== undefined)
    expect(urls.length).toBeGreaterThan(featuredProjects.length)
    for (const url of urls) {
      expect(publicFileExists(url), url).toBe(true)
    }
  })
})

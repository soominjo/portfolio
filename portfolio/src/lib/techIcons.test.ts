import { describe, expect, it } from 'vitest'
import { getTechIcon } from './techIcons'

describe('getTechIcon', () => {
  it('returns the Simple Icons mark for a known name', () => {
    expect(getTechIcon('React')).toEqual({
      title: 'React',
      hex: '61DAFB',
      path: expect.stringMatching(/^M/),
    })
  })

  it('ignores case and surrounding spaces', () => {
    expect(getTechIcon('  next.JS ')).toEqual(getTechIcon('Next.js'))
    expect(getTechIcon('Next.js')).not.toBeNull()
  })

  it('maps combined entries to their main mark', () => {
    expect(getTechIcon('Firebase / Firestore')?.title).toBe('Firebase')
    expect(getTechIcon('MySQL / Cloud SQL')?.title).toBe('MySQL')
    expect(getTechIcon('TanStack Query')?.title).toBe('React Query')
  })

  it('covers the names the project data uses', () => {
    const expected: Record<string, string> = {
      Firebase: 'Firebase',
      'Cloud SQL': 'Google Cloud',
      'Google Vertex AI': 'Google Cloud',
      'Cloud Vision OCR': 'Google Cloud',
      'Gemini LLMs': 'Google Gemini',
      Mapbox: 'Mapbox',
      Sanity: 'Sanity',
      HTML: 'HTML5',
      'Node.js': 'Node.js',
      'Tailwind CSS': 'Tailwind CSS',
      'Framer Motion': 'Framer',
      'Next.js': 'Next.js',
    }
    for (const [name, title] of Object.entries(expected)) {
      expect(getTechIcon(name)?.title, name).toBe(title)
    }
  })

  it('returns null for tools Simple Icons does not carry', () => {
    for (const name of ['Playwright', 'Zustand', 'Genkit', 'Google Stitch']) {
      expect(getTechIcon(name)).toBeNull()
    }
  })

  it('returns null for concepts and unknown names', () => {
    for (const name of ['RAG Pipelines', 'CI/CD', '', 'Not a real tool']) {
      expect(getTechIcon(name)).toBeNull()
    }
  })

  it('hands out icons that cannot be changed', () => {
    const icon = getTechIcon('React')
    expect(Object.isFrozen(icon)).toBe(true)
  })
})

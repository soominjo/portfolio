import { describe, expect, it } from 'vitest'
import { skillGroups, type SkillGroup } from '../../../../shared/data/skills'
import { contrastRatio } from '../../lib/brandColor'
import { getTechIcon } from '../../lib/techIcons'
import { ACCENT_COLORS, TILE_COLORS, buildSkillRows } from './skillModel'

const mixedGroup: SkillGroup = {
  category: 'Mixed',
  icon: '◇',
  skills: ['Playwright', 'React', 'CI/CD', 'Next.js'],
}

describe('buildSkillRows', () => {
  it('keeps every category, its glyph and all of its skills', () => {
    const rows = buildSkillRows(skillGroups)

    expect(rows.map((row) => row.category)).toEqual(skillGroups.map((group) => group.category))
    expect(rows.map((row) => row.glyph)).toEqual(skillGroups.map((group) => group.icon))
    rows.forEach((row, index) => {
      const names = row.items.map((item) => item.name)
      expect([...names].sort()).toEqual([...skillGroups[index].skills].sort())
    })
  })

  it('lists skills with a logo first, then text-only ones, each in source order', () => {
    const [row] = buildSkillRows([mixedGroup])
    expect(row.items.map((item) => item.name)).toEqual(['React', 'Next.js', 'Playwright', 'CI/CD'])
  })

  it('gives each logo skill its path and a readable colour for both themes', () => {
    const [row] = buildSkillRows([mixedGroup])
    const react = row.items.find((item) => item.name === 'React')
    const next = row.items.find((item) => item.name === 'Next.js')

    expect(react?.mark?.path).toBe(getTechIcon('React')?.path)
    expect(react?.mark?.dark).toBe('#61dafb')
    expect(contrastRatio(react?.mark?.light ?? '', TILE_COLORS.light.tile)).toBeGreaterThanOrEqual(3)

    // A black mark would vanish on the dark tile, so it takes the text colour there.
    expect(next?.mark?.dark).toBe(TILE_COLORS.dark.foreground)
    expect(next?.mark?.light).toBe('#000000')
  })

  it('leaves text-only skills without a mark', () => {
    const [row] = buildSkillRows([mixedGroup])
    expect(row.items.find((item) => item.name === 'Playwright')?.mark).toBeNull()
    expect(row.items.find((item) => item.name === 'CI/CD')?.mark).toBeNull()
  })

  it('does not change the groups it is given', () => {
    const groups = [mixedGroup]
    const before = structuredClone(groups)
    buildSkillRows(groups)
    expect(groups).toEqual(before)
  })
})

describe('the shared skill list', () => {
  it('keeps every logo, and the accent, at 3:1 or better on both themes', () => {
    const marks = buildSkillRows(skillGroups).flatMap((row) =>
      row.items.flatMap((item) => (item.mark ? [{ name: item.name, ...item.mark }] : [])),
    )
    const swatches = [...marks, { name: 'accent', ...ACCENT_COLORS }]

    expect(marks.length).toBeGreaterThan(20)
    for (const { name, dark, light } of swatches) {
      expect(contrastRatio(dark, TILE_COLORS.dark.tile), `${name} on the dark tile`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(light, TILE_COLORS.light.tile), `${name} on the light tile`).toBeGreaterThanOrEqual(3)
    }
  })

  // Pins which skills render as text. A typo in a name, or a combined entry
  // such as "Django / Laravel / PHP", would quietly lose its logo otherwise.
  it('has a logo for everything except tools Simple Icons lacks and concepts', () => {
    const textOnly = buildSkillRows(skillGroups)
      .flatMap((row) => row.items)
      .filter((item) => item.mark === null)
      .map((item) => item.name)

    expect([...textOnly].sort()).toEqual(
      [
        'CI/CD',
        'Computer Vision',
        'Genkit',
        'Google Stitch',
        'LLM Integration',
        'Playwright',
        'RAG Pipelines',
        'Vectorization',
        'Zustand',
      ].sort(),
    )
  })
})

import { describe, expect, it } from 'vitest'
import { featuredProjects } from '../../../../../shared/data/projects'
import { orderForShowcase } from '../showcaseOrder'
import type { Rgb } from './backdropTypes'
import { backdropFor, PROJECT_BACKDROPS } from './projectBackdrops'
import { SCENES } from './scenes'

const isColour = (rgb: Rgb) => rgb.length === 3 && rgb.every((channel) => Number.isInteger(channel) && channel >= 0 && channel <= 255)

describe('project backdrops', () => {
  it('gives every featured project its own scene', () => {
    const scenes = featuredProjects.map((project) => backdropFor(project.id)?.scene)
    expect(scenes.every(Boolean)).toBe(true)
    expect(new Set(scenes).size).toBe(featuredProjects.length)
  })

  it('never shows the same scene twice in a row', () => {
    const ordered = orderForShowcase(featuredProjects)
    ordered.slice(1).forEach((project, index) => {
      expect(backdropFor(project.id)?.scene).not.toBe(backdropFor(ordered[index].id)?.scene)
    })
  })

  it('only names scenes that exist', () => {
    for (const backdrop of Object.values(PROJECT_BACKDROPS)) expect(SCENES[backdrop.scene]).toBeDefined()
  })

  it('has valid, faint colours in both themes', () => {
    for (const backdrop of Object.values(PROJECT_BACKDROPS)) {
      for (const palette of Object.values(backdrop.palettes)) {
        for (const { rgb, alpha } of [palette.line, palette.glow, palette.corner]) {
          expect(isColour(rgb)).toBe(true)
          expect(alpha).toBeGreaterThan(0)
          expect(alpha).toBeLessThanOrEqual(0.3)
        }
        for (const accent of [palette.accent, palette.accent2, palette.accent3]) {
          if (accent) expect(isColour(accent)).toBe(true)
        }
      }
    }
  })

  it('keeps the rings for unknown or missing projects', () => {
    expect(backdropFor('not-a-project')).toBeNull()
    expect(backdropFor(undefined)).toBeNull()
    expect(backdropFor('toString')).toBeNull()
  })
})

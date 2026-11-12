import { describe, expect, it } from 'vitest'
import {
  LAST_STEP_CLASS,
  LAST_STEP_SVH,
  LEAD_SVH,
  pinnedDwell,
  STAGE_SVH,
  STEP_CLASS,
  STEP_SVH,
  TRACK_OFFSET_CLASS,
} from './showcaseGeometry'

describe('the geometry classes', () => {
  // Tailwind needs literal class names, so they're spelled out; this keeps them
  // in step with the numbers the dwell maths uses.
  it('encode the same distances as the constants', () => {
    expect(STEP_CLASS).toBe(`h-[${STEP_SVH}svh]`)
    expect(LAST_STEP_CLASS).toBe(`h-[${LAST_STEP_SVH}svh]`)
    expect(TRACK_OFFSET_CLASS).toBe(`-mt-[${STAGE_SVH - LEAD_SVH}svh]`)
  })
})

describe('pinnedDwell', () => {
  it('keeps every project on the pinned stage for the same scroll distance', () => {
    expect(pinnedDwell(11)).toEqual(Array(11).fill(75))
  })

  it('works for a single project', () => {
    expect(pinnedDwell(1)).toEqual([75])
  })
})

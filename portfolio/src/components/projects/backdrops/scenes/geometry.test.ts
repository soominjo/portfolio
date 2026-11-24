import { describe, expect, it } from 'vitest'
import { VIRTUAL } from '../backdropLayout'
import { rayBand, ribbonEdge, ribbonHeight, RIBBONS } from './aurora'
import { CURSOR_STOPS, PARTS } from './blueprint'
import { pointAlong, TRACES } from './circuit'
import { BUILDINGS, PINS, STREETS_ACROSS, STREETS_DOWN } from './citymap'
import { cellCentre, cellsIn, HEX_RADIUS, SKILLS } from './hexes'
import { CHART, TRANCHE_XS } from './ledger'
import { BEAT, ecgAt, plethAt } from './monitor'
import { FIELDS, WORDS } from './ocr'
import { bendJoint, cyclistPose, FIGURES, jumperPose, limb, runnerPose, type Point } from './pose'
import { CONSTELLATIONS, SPECKS } from './stars'
import { wispPath, WISPS } from './steam'

const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1])

// Roughly where the laptop and phone sit on the virtual stage.
const behindDevices = ([x, y]: readonly [number, number]) => x > 680 && x < 1400 && y > 236 && y < 665
// Projects without a phone show the laptop alone, in the middle.
const behindLoneLaptop = ([x, y]: readonly [number, number]) => x > 698 && x < 1318 && y > 236 && y < 665

describe('pose', () => {
  it('places limbs at their length and angle', () => {
    const [x, y] = limb([0, 0], 0, 40)
    expect(x).toBeCloseTo(0)
    expect(y).toBeCloseTo(40)
    expect(limb([0, 0], Math.PI / 2, 10)[0]).toBeCloseTo(10)
  })

  it('bends a knee forward while keeping both bones their length', () => {
    const hip: Point = [0, 0]
    const foot: Point = [10, 60]
    const knee = bendJoint(hip, foot, 36, 36)
    expect(distance(hip, knee)).toBeCloseTo(36)
    expect(distance(knee, foot)).toBeCloseTo(36)
    expect(knee[0]).toBeGreaterThan(foot[0] / 2)
  })

  it('keeps the runner and cyclist limbs their length through the stride', () => {
    for (let phase = 0; phase < Math.PI * 2; phase += 0.7) {
      const runner = runnerPose(phase).points
      expect(distance(runner.hip, runner.knee0)).toBeCloseTo(40)
      expect(distance(runner.knee1, runner.ankle1)).toBeCloseTo(40)
      const cyclist = cyclistPose(phase).points
      expect(distance(cyclist.hip, cyclist.knee0)).toBeCloseTo(36)
      expect(distance(cyclist.knee0, cyclist.ankle0)).toBeCloseTo(36)
    }
  })

  it('lands the jumper on the ground when crouched and lifts it clear at the top', () => {
    const crouched = jumperPose(-Math.PI / 2)
    const airborne = jumperPose(Math.PI / 2)
    expect(Math.abs(crouched.points.ankle0[1] - crouched.ground!)).toBeLessThan(2)
    expect(airborne.points.ankle0[1]).toBeLessThan(airborne.ground! - 20)
    expect(airborne.points.hand0[1]).toBeLessThan(airborne.points.head[1])
  })

  it('keeps every figure clear of the devices', () => {
    for (const figure of FIGURES) expect(behindDevices([figure.x, figure.y])).toBe(false)
  })
})

describe('ledger', () => {
  it('climbs from bottom-left to top-right across the tranches', () => {
    expect(CHART[0][1]).toBeGreaterThan(CHART[CHART.length - 1][1] + 500)
    for (const x of TRANCHE_XS) expect(CHART.some(([chartX]) => chartX === x)).toBe(true)
  })
})

describe('steam', () => {
  it('rises from its start and drifts only a little sideways', () => {
    for (const wisp of WISPS) {
      const path = wispPath(wisp, 0, 3)
      expect(path[path.length - 1][1]).toBeCloseTo(wisp.y - wisp.length)
      for (const [x] of path) expect(Math.abs(x - wisp.x)).toBeLessThan(60)
    }
  })
})

describe('citymap', () => {
  it('keeps pins out from behind the laptop', () => {
    for (const pin of PINS) expect(behindLoneLaptop([pin.x, pin.y])).toBe(false)
  })

  it('keeps buildings off the streets', () => {
    expect(BUILDINGS.length).toBeGreaterThan(10)
    for (const [x, y, width, height] of BUILDINGS) {
      for (const street of STREETS_ACROSS) expect(Math.abs(y + height / 2 - street)).toBeGreaterThanOrEqual(height / 2 + 7)
      for (const street of STREETS_DOWN) expect(Math.abs(x + width / 2 - street)).toBeGreaterThanOrEqual(width / 2 + 7)
    }
  })
})

describe('ocr', () => {
  it('writes words above and below the devices only', () => {
    for (const [x, y] of WORDS) expect(behindDevices([x, y])).toBe(false)
  })

  it('boxes fields that exist', () => {
    for (const field of FIELDS) expect(WORDS[field.word]).toBeDefined()
  })
})

describe('monitor', () => {
  it('spikes once per beat', () => {
    const samples = Array.from({ length: 200 }, (_, step) => ecgAt((step / 200) * BEAT))
    const peak = samples.indexOf(Math.max(...samples))
    expect(peak / 200).toBeCloseTo(0.42, 1)
    expect(ecgAt(0.1)).toBeCloseTo(ecgAt(0.1 + BEAT))
  })

  it('pulses the oxygen trace in step with the heart', () => {
    expect(plethAt(0.3 * BEAT)).toBeGreaterThan(0.8)
    expect(plethAt(0.9 * BEAT)).toBeLessThan(0.05)
  })
})

describe('blueprint', () => {
  it('draws four parts and pauses the cursor on each', () => {
    expect(PARTS).toHaveLength(4)
    for (const part of PARTS) expect(part.segments.length).toBeGreaterThan(4)
    expect(CURSOR_STOPS).toHaveLength(PARTS.length)
  })
})

describe('circuit', () => {
  it('routes every trace from outside the devices to behind them', () => {
    for (const trace of TRACES) {
      const [start, , end] = trace.points
      expect(Math.hypot(start[0] - VIRTUAL.centerX, start[1] - VIRTUAL.centerY)).toBeGreaterThan(400)
      expect(Math.hypot(end[0] - VIRTUAL.centerX, end[1] - VIRTUAL.centerY)).toBeLessThan(240)
      expect(pointAlong(trace, 0)).toEqual(start)
      const [x, y] = pointAlong(trace, trace.length)
      expect(x).toBeCloseTo(end[0])
      expect(y).toBeCloseTo(end[1])
    }
  })
})

describe('hexes', () => {
  it('tiles the lattice with odd columns half a row lower', () => {
    expect(cellCentre(0, 0)).toEqual([512, 10])
    expect(cellCentre(1, 0)[1] - cellCentre(0, 0)[1]).toBeCloseTo((HEX_RADIUS * Math.sqrt(3)) / 2)
  })

  it('covers the whole view, however wide', () => {
    const cells = cellsIn({ left: -400, top: -100, right: 2400, bottom: 1000 })
    expect(cells.some(([x]) => x < -400)).toBe(true)
    expect(cells.some(([x]) => x > 2400)).toBe(true)
  })

  it('spreads the skill cells apart and away from the devices', () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(10)
    for (const skill of SKILLS) {
      expect(behindDevices(skill.cell)).toBe(false)
      expect(skill.level).toBeGreaterThanOrEqual(1)
      expect(skill.level).toBeLessThanOrEqual(5)
    }
  })
})

describe('stars', () => {
  it('only links stars that exist', () => {
    for (const constellation of CONSTELLATIONS) {
      for (const [from, to] of constellation.links) {
        expect(constellation.stars[from]).toBeDefined()
        expect(constellation.stars[to]).toBeDefined()
      }
    }
    expect(SPECKS).toHaveLength(220)
  })
})

describe('aurora', () => {
  it('sways each curtain around its line and keeps it tall', () => {
    for (const ribbon of RIBBONS) {
      for (let x = 0; x < 1600; x += 160) {
        expect(Math.abs(ribbonEdge(ribbon, x, 5) - ribbon.y)).toBeLessThanOrEqual(ribbon.sway * 1.4 + 0.001)
        expect(ribbonHeight(ribbon, x, 5)).toBeGreaterThan(ribbon.height * 0.19)
      }
    }
  })

  it('sorts every ray into one of the brightness bands', () => {
    const bands = new Set(Array.from({ length: 200 }, (_, step) => rayBand(RIBBONS[0], step * 12, 2, 4)))
    expect([...bands].every((band) => band >= 0 && band < 4)).toBe(true)
    expect(bands.size).toBe(4)
  })
})

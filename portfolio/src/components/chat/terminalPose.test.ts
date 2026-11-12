import { describe, expect, it } from 'vitest'
import { getTerminalAngles, getTerminalPose } from './terminalPose'

describe('getTerminalPose', () => {
  it.each([
    [false, false, 'rest'],
    [false, true, 'hover'],
    [true, false, 'engaged'],
    [true, true, 'engaged'],
  ] as const)('engaged=%s hovered=%s → %s', (engaged, hovered, pose) => {
    expect(getTerminalPose(engaged, hovered)).toBe(pose)
  })
})

describe('getTerminalAngles', () => {
  it.each([
    ['rest', { rotateY: -24, rotateX: 2 }],
    ['hover', { rotateY: -9, rotateX: 0 }],
    ['engaged', { rotateY: 0, rotateX: 0 }],
  ] as const)('tilts the %s pose', (pose, angles) => {
    expect(getTerminalAngles(pose, true)).toEqual(angles)
  })

  it('faces straight on where tilting is off', () => {
    expect(getTerminalAngles('rest', false)).toEqual({ rotateY: 0, rotateX: 0 })
  })
})

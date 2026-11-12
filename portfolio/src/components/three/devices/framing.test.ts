import { describe, expect, it } from 'vitest'
import { frameDevices } from './framing'

describe('frameDevices', () => {
  it('moves the camera back for narrower canvases', () => {
    expect(frameDevices(0.8, 30).cameraZ).toBeGreaterThan(frameDevices(1.8, 30).cameraZ)
  })

  it('stops moving once the canvas is wide enough for the height to decide', () => {
    expect(frameDevices(3, 30).cameraZ).toBeCloseTo(frameDevices(4, 30).cameraZ)
  })

  it('looks down at the devices from above', () => {
    const framing = frameDevices(1.6, 30)
    expect(framing.cameraY).toBeGreaterThan(framing.targetY)
  })

  it.each([0, -1, Number.NaN])('stays finite for the bad aspect %s', (aspect) => {
    expect(Number.isFinite(frameDevices(aspect, 30).cameraZ)).toBe(true)
  })
})

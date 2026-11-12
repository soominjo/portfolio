import { CanvasTexture, DataTexture } from 'three'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPlaceholderTexture } from './placeholderTexture'

// Just enough of a 2D context to record what gets drawn.
function fakeContext() {
  const gradient = { addColorStop: vi.fn() }
  return {
    createLinearGradient: vi.fn(() => gradient),
    createRadialGradient: vi.fn(() => gradient),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
  }
}

describe('createPlaceholderTexture', () => {
  afterEach(() => vi.restoreAllMocks())

  it("draws the project's initial and name", () => {
    const context = fakeContext()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    const texture = createPlaceholderTexture('flux')
    expect(texture).toBeInstanceOf(CanvasTexture)
    const drawn = context.fillText.mock.calls.map(([text]) => text)
    expect(drawn).toContain('F')
    expect(drawn).toContain('flux')
  })

  it('falls back to a plain tile without a 2D context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(createPlaceholderTexture('Flux')).toBeInstanceOf(DataTexture)
  })
})

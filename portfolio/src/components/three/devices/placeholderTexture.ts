import { CanvasTexture, DataTexture, RGBAFormat, SRGBColorSpace, type Texture } from 'three'

// Phone-shaped (about 9:19.5), in the site's palette.
const WIDTH = 512
const HEIGHT = 1100
const GRID_STEP = 48
const FALLBACK_RGBA = [11, 16, 34, 255] // #0b1022

function drawBackdrop(context: CanvasRenderingContext2D): void {
  const fade = context.createLinearGradient(0, 0, 0, HEIGHT)
  fade.addColorStop(0, '#0b1022')
  fade.addColorStop(1, '#05070f')
  context.fillStyle = fade
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.strokeStyle = 'rgba(99, 102, 241, 0.12)'
  context.lineWidth = 1
  context.beginPath()
  for (let x = GRID_STEP; x < WIDTH; x += GRID_STEP) {
    context.moveTo(x, 0)
    context.lineTo(x, HEIGHT)
  }
  for (let y = GRID_STEP; y < HEIGHT; y += GRID_STEP) {
    context.moveTo(0, y)
    context.lineTo(WIDTH, y)
  }
  context.stroke()

  const glow = context.createRadialGradient(WIDTH / 2, HEIGHT * 0.42, 0, WIDTH / 2, HEIGHT * 0.42, WIDTH * 0.6)
  glow.addColorStop(0, 'rgba(99, 102, 241, 0.35)')
  glow.addColorStop(1, 'rgba(99, 102, 241, 0)')
  context.fillStyle = glow
  context.fillRect(0, 0, WIDTH, HEIGHT)
}

function drawLabel(context: CanvasRenderingContext2D, label: string): void {
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = '#e2e8f0'
  context.font = "700 220px Syne, 'DM Sans', sans-serif"
  context.fillText(label.charAt(0).toUpperCase(), WIDTH / 2, HEIGHT * 0.42)
  context.fillStyle = '#94a3b8'
  context.font = "500 34px 'DM Sans', sans-serif"
  context.fillText(label, WIDTH / 2, HEIGHT * 0.6, WIDTH - 80)
}

function solidTexture(): Texture {
  const texture = new DataTexture(new Uint8Array(FALLBACK_RGBA), 1, 1, RGBAFormat)
  texture.colorSpace = SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

/**
 * Stand-in phone screen until a real mobile screenshot exists: the project's
 * initial and name on the site gradient. A plain tile without a 2D context.
 */
export function createPlaceholderTexture(label: string): Texture {
  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) return solidTexture()
  drawBackdrop(context)
  drawLabel(context, label)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

import type { Theme } from '../../../hooks/useTheme'

export type Rgb = readonly [red: number, green: number, blue: number]

/** A colour and the opacity it is drawn at on the full-size stage. */
export interface Tint {
  readonly rgb: Rgb
  readonly alpha: number
}

/** One project's colours for one theme, taken from its own screenshot. */
export interface Palette {
  /** Fine lines, grids and outlines. */
  readonly line: Tint
  /** The soft glow behind the devices. */
  readonly glow: Tint
  /** The smaller glow in the bottom-right corner. */
  readonly corner: Tint
  /** Highlights: moving dots, live labels, drawn shapes. */
  readonly accent: Rgb
  /** A second highlight, for scenes that use one (see each scene). */
  readonly accent2?: Rgb
  /** A third highlight, for scenes that use one (see each scene). */
  readonly accent3?: Rgb
}

/** The part of the virtual stage that the canvas shows, in virtual units. */
export interface ViewRect {
  readonly left: number
  readonly top: number
  readonly right: number
  readonly bottom: number
}

/** Everything a scene needs to draw one frame, in virtual-stage units. */
export interface SceneFrame {
  readonly ctx: CanvasRenderingContext2D
  /** Seconds since the backdrop started; fixed under reduced motion. */
  readonly time: number
  /** False under reduced motion, when scenes draw their finished, still state. */
  readonly motion: boolean
  readonly theme: Theme
  readonly palette: Palette
  /** One CSS pixel, in virtual units: the width of a hairline. */
  readonly px: number
  readonly view: ViewRect
  /** How far from the device centre anything shows, in virtual units; the fade hides the rest. */
  readonly reach: number
}

/** Which glow sits behind a scene. */
export type GlowKind = 'base' | 'warm'

export interface Scene {
  /** Parts that never move, drawn once per size and theme and then reused. */
  readonly drawStatic?: (frame: SceneFrame) => void
  /** Parts that move, drawn on every frame. */
  readonly draw: (frame: SceneFrame) => void
  /** Defaults to 'base': the glow behind the devices plus the corner glow. */
  readonly glow?: GlowKind
}

export type SceneId =
  | 'pose'
  | 'ledger'
  | 'steam'
  | 'citymap'
  | 'ocr'
  | 'monitor'
  | 'blueprint'
  | 'circuit'
  | 'hexes'
  | 'stars'
  | 'aurora'

/** The scene a project shows behind its devices, and its colours in each theme. */
export interface ProjectBackdrop {
  readonly scene: SceneId
  readonly palettes: Readonly<Record<Theme, Palette>>
}

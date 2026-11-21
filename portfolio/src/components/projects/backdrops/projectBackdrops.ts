import type { Palette, ProjectBackdrop, Rgb, SceneId, Tint } from './backdropTypes'

// Which scene each project shows behind its devices, in colours taken from the
// project's own screenshot. A project missing from here keeps the plain rings
// (StageBackground). Picked by the user on 2026-11-12 to 2026-11-15; see
// docs/superpowers/specs/2026-11-15-project-backdrops-design.md.

const tint = (red: number, green: number, blue: number, alpha: number): Tint => ({ rgb: [red, green, blue], alpha })

interface Colours {
  readonly line: Tint
  readonly glow: Tint
  readonly corner: Tint
  readonly accent: Rgb
  readonly accent2?: Rgb
  readonly accent3?: Rgb
}

const backdrop = (scene: SceneId, dark: Colours, light: Colours): ProjectBackdrop => ({
  scene,
  palettes: { dark: dark satisfies Palette, light: light satisfies Palette },
})

export const PROJECT_BACKDROPS: Readonly<Record<string, ProjectBackdrop>> = {
  // Purple and orange, like the Flinki app.
  flinki: backdrop(
    'pose',
    { line: tint(192, 132, 252, 0.16), glow: tint(124, 58, 237, 0.26), corner: tint(249, 115, 22, 0.12), accent: [251, 146, 60] },
    { line: tint(126, 34, 206, 0.12), glow: tint(124, 58, 237, 0.11), corner: tint(249, 115, 22, 0.09), accent: [234, 88, 12] },
  ),
  // Inner SPARC blue, with money green.
  'commission-monitoring-system': backdrop(
    'ledger',
    { line: tint(96, 165, 250, 0.15), glow: tint(37, 99, 235, 0.24), corner: tint(16, 185, 129, 0.1), accent: [52, 211, 153] },
    { line: tint(29, 78, 216, 0.12), glow: tint(37, 99, 235, 0.1), corner: tint(16, 185, 129, 0.08), accent: [5, 150, 105] },
  ),
  // String-light amber and garden green.
  'unwnd-cafe': backdrop(
    'steam',
    { line: tint(253, 224, 171, 0.15), glow: tint(245, 158, 11, 0.18), corner: tint(34, 139, 84, 0.13), accent: [251, 191, 36] },
    { line: tint(146, 95, 40, 0.14), glow: tint(217, 119, 6, 0.1), corner: tint(22, 101, 52, 0.08), accent: [180, 83, 9] },
  ),
  // The lavender-to-pink of its sign-in screen.
  'leads-management-system': backdrop(
    'citymap',
    { line: tint(196, 181, 253, 0.15), glow: tint(79, 70, 229, 0.22), corner: tint(236, 72, 153, 0.1), accent: [244, 114, 182] },
    { line: tint(91, 33, 182, 0.12), glow: tint(79, 70, 229, 0.1), corner: tint(236, 72, 153, 0.08), accent: [219, 39, 119] },
  ),
  // Deep navy and sky blue; amber marks the violation.
  'maneho-ai': backdrop(
    'ocr',
    { line: tint(125, 211, 252, 0.15), glow: tint(30, 64, 175, 0.3), corner: tint(59, 130, 246, 0.1), accent: [96, 165, 250], accent2: [251, 191, 36] },
    { line: tint(3, 105, 161, 0.12), glow: tint(30, 64, 175, 0.1), corner: tint(59, 130, 246, 0.08), accent: [37, 99, 235], accent2: [217, 119, 6] },
  ),
  // Fitness green, with a rose heart.
  'flux-fitness-tracker': backdrop(
    'monitor',
    { line: tint(110, 231, 183, 0.14), glow: tint(22, 163, 74, 0.18), corner: tint(244, 63, 94, 0.1), accent: [251, 113, 133], accent2: [74, 222, 128] },
    { line: tint(21, 128, 61, 0.12), glow: tint(22, 163, 74, 0.09), corner: tint(244, 63, 94, 0.08), accent: [225, 29, 72], accent2: [22, 163, 74] },
  ),
  // CAD-screen lime.
  cadpractice: backdrop(
    'blueprint',
    { line: tint(163, 230, 53, 0.14), glow: tint(22, 163, 74, 0.18), corner: tint(163, 230, 53, 0.08), accent: [190, 242, 100] },
    { line: tint(77, 124, 15, 0.13), glow: tint(22, 163, 74, 0.08), corner: tint(101, 163, 13, 0.08), accent: [77, 124, 15] },
  ),
  // Switchboard's navy and "Route." blue.
  switchboard: backdrop(
    'circuit',
    { line: tint(147, 197, 253, 0.15), glow: tint(37, 99, 235, 0.26), corner: tint(56, 189, 248, 0.1), accent: [56, 189, 248] },
    { line: tint(29, 78, 216, 0.12), glow: tint(37, 99, 235, 0.1), corner: tint(14, 165, 233, 0.08), accent: [2, 132, 199] },
  ),
  // Teal, with the app's blue.
  tms: backdrop(
    'hexes',
    { line: tint(94, 234, 212, 0.14), glow: tint(13, 148, 136, 0.2), corner: tint(37, 99, 235, 0.1), accent: [45, 212, 191] },
    { line: tint(15, 118, 110, 0.12), glow: tint(13, 148, 136, 0.09), corner: tint(37, 99, 235, 0.07), accent: [13, 148, 136] },
  ),
  // Mythica's orange and deep blue; warm white (navy in light) stars.
  mythica: backdrop(
    'stars',
    { line: tint(245, 166, 90, 0.16), glow: tint(42, 111, 151, 0.28), corner: tint(224, 123, 22, 0.12), accent: [245, 166, 90], accent2: [255, 240, 220] },
    { line: tint(194, 90, 12, 0.13), glow: tint(42, 111, 151, 0.12), corner: tint(224, 123, 22, 0.09), accent: [194, 90, 12], accent2: [11, 26, 51] },
  ),
  // Reviva pink, with aurora green and violet.
  reviva: backdrop(
    'aurora',
    { line: tint(249, 168, 212, 0.15), glow: tint(16, 185, 129, 0.14), corner: tint(236, 72, 153, 0.1), accent: [244, 114, 182], accent2: [52, 211, 153], accent3: [167, 139, 250] },
    { line: tint(190, 24, 93, 0.12), glow: tint(16, 185, 129, 0.08), corner: tint(236, 72, 153, 0.08), accent: [219, 39, 119], accent2: [5, 150, 105], accent3: [124, 58, 237] },
  ),
}

/** The backdrop for a project, or null to keep the plain rings. */
export function backdropFor(projectId: string | undefined): ProjectBackdrop | null {
  if (!projectId || !Object.hasOwn(PROJECT_BACKDROPS, projectId)) return null
  return PROJECT_BACKDROPS[projectId]
}

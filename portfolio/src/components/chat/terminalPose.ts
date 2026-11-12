/** How the terminal holds itself: tilted at rest, turning on hover, facing the visitor once they engage. */
export type TerminalPose = 'rest' | 'hover' | 'engaged'

export interface TerminalAngles {
  readonly rotateY: number
  readonly rotateX: number
}

/** Edge-on and out of sight: where the hinge swing starts and ends. */
export const CLOSED_ROTATE_Y = -96

const POSE_ANGLES: Readonly<Record<TerminalPose, TerminalAngles>> = {
  rest: { rotateY: -24, rotateX: 2 },
  hover: { rotateY: -9, rotateX: 0 },
  engaged: { rotateY: 0, rotateX: 0 },
}

const FACING: TerminalAngles = { rotateY: 0, rotateX: 0 }

/** Engaging beats hovering, so the text stays straight while the visitor types. */
export function getTerminalPose(engaged: boolean, hovered: boolean): TerminalPose {
  if (engaged) return 'engaged'
  return hovered ? 'hover' : 'rest'
}

/** Touch screens, narrow screens and reduced motion always face straight on. */
export function getTerminalAngles(pose: TerminalPose, canTilt: boolean): TerminalAngles {
  return canTilt ? POSE_ANGLES[pose] : FACING
}

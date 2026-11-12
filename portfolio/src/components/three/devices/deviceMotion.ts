// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.
import { applyFinish, type DeviceMaterials } from './deviceMaterials'
import type { DeviceRig } from './deviceRig'
import type { DeviceSlide } from './deviceTypes'
import { FINISHES, type FinishSpec } from './finishes'
import { LID_CLOSED, LID_OPEN } from './laptopModel'
import { clamp01, easeInOutCubic, isSettled, stepSpring, type SpringConfig, type SpringState } from './motionMath'

/** Springs and tweens for the devices: the intro, the phone, the finish and the cursor lean. */
export interface DeviceMotion {
  setSlide(slide: DeviceSlide, immediate: boolean): void
  playIntro(immediate: boolean): void
  /** Pointer position across the window, each axis -0.5..0.5. */
  setPointer(x: number, y: number): void
  /** Advances everything to `nowMs` and poses the rig; true while anything moves. */
  update(nowMs: number): boolean
}

type SpringKey = 'lid' | 'phone' | 'shift' | 'leanX' | 'leanY'
type MotionState = Readonly<Record<SpringKey, SpringState>>
type MotionTargets = Readonly<Record<SpringKey, number>>

const SPRING_KEYS: readonly SpringKey[] = ['lid', 'phone', 'shift', 'leanX', 'leanY']
// Hamish's values: the lid swings open at 80/20, the phone springs up at
// 60/20, and the cursor lean follows at 40/20 with mass 1.4.
const SPRINGS: Readonly<Record<SpringKey, SpringConfig>> = {
  lid: { stiffness: 80, damping: 20, mass: 1 },
  phone: { stiffness: 60, damping: 20, mass: 1 },
  shift: { stiffness: 120, damping: 24, mass: 1 },
  leanX: { stiffness: 40, damping: 20, mass: 1.4 },
  leanY: { stiffness: 40, damping: 20, mass: 1.4 },
}
const LID_DELAY_MS = 200
const PHONE_DELAY_MS = 450
const LEAN_RANGE = { x: 0.2, y: 0.35 } as const
const LAPTOP_X = { withPhone: -0.45, alone: 0 } as const
const FINISH_MS = 450

function rest(value: number): SpringState {
  return { value, velocity: 0 }
}

function stepAll(state: MotionState, targets: MotionTargets, dt: number): MotionState {
  return {
    lid: stepSpring(state.lid, targets.lid, SPRINGS.lid, dt),
    phone: stepSpring(state.phone, targets.phone, SPRINGS.phone, dt),
    shift: stepSpring(state.shift, targets.shift, SPRINGS.shift, dt),
    leanX: stepSpring(state.leanX, targets.leanX, SPRINGS.leanX, dt),
    leanY: stepSpring(state.leanY, targets.leanY, SPRINGS.leanY, dt),
  }
}

function readFinish(materials: DeviceMaterials): FinishSpec {
  return {
    body: `#${materials.body.color.getHexString()}`,
    metalness: materials.body.metalness,
    roughness: materials.body.roughness,
    keys: `#${materials.keys.color.getHexString()}`,
  }
}

export function createDeviceMotion(rig: DeviceRig): DeviceMotion {
  let state: MotionState = { lid: rest(LID_CLOSED), phone: rest(0), shift: rest(LAPTOP_X.withPhone), leanX: rest(0), leanY: rest(0) }
  let slide: DeviceSlide | null = null
  let pointer = { x: 0, y: 0 }
  let introStart: number | null = null
  let introPending = false
  let lastNow: number | null = null
  let finish: { from: FinishSpec; to: FinishSpec; start: number | null } | null = null

  const reached = (now: number, delay: number) => introStart !== null && now - introStart >= delay
  const laptopX = () => (slide?.showPhone === false ? LAPTOP_X.alone : LAPTOP_X.withPhone)

  const targetsAt = (now: number): MotionTargets => ({
    lid: reached(now, LID_DELAY_MS) ? LID_OPEN : LID_CLOSED,
    phone: reached(now, PHONE_DELAY_MS) && slide?.showPhone ? 1 : 0,
    shift: laptopX(),
    leanX: pointer.y * LEAN_RANGE.x,
    leanY: pointer.x * LEAN_RANGE.y,
  })

  const stepFinish = (now: number): boolean => {
    if (!finish) return false
    finish.start ??= now
    const t = clamp01((now - finish.start) / FINISH_MS)
    applyFinish(rig.materials, finish.from, finish.to, easeInOutCubic(t))
    if (t >= 1) finish = null
    return finish !== null
  }

  return {
    setSlide(next, immediate) {
      const finishChanged = slide?.finish !== next.finish
      slide = next
      if (immediate) {
        state = { ...state, shift: rest(laptopX()), phone: introStart === null ? state.phone : rest(next.showPhone ? 1 : 0) }
        applyFinish(rig.materials, FINISHES[next.finish], FINISHES[next.finish], 1)
        finish = null
      } else if (finishChanged) {
        finish = { from: readFinish(rig.materials), to: FINISHES[next.finish], start: null }
      }
    },
    playIntro(immediate) {
      if (introStart !== null || introPending) return
      if (!immediate) {
        introPending = true
        return
      }
      introStart = Number.NEGATIVE_INFINITY
      state = { ...state, lid: rest(LID_OPEN), phone: rest(slide?.showPhone ? 1 : 0) }
    },
    setPointer(x, y) {
      pointer = { x, y }
    },
    update(nowMs) {
      const dt = lastNow === null ? 0 : (nowMs - lastNow) / 1000
      lastNow = nowMs
      if (introPending) {
        introStart = nowMs
        introPending = false
      }
      const targets = targetsAt(nowMs)
      state = stepAll(state, targets, dt)
      const finishing = stepFinish(nowMs)
      rig.applyPose({
        lidAngle: state.lid.value,
        laptopX: state.shift.value,
        phonePresence: state.phone.value,
        leanX: state.leanX.value,
        leanY: state.leanY.value,
      })
      const waitingOnIntro = introStart !== null && nowMs - introStart < PHONE_DELAY_MS
      return finishing || waitingOnIntro || SPRING_KEYS.some((key) => !isSettled(state[key], targets[key]))
    },
  }
}

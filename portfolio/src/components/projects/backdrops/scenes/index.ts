import type { Scene, SceneId } from '../backdropTypes'
import { aurora } from './aurora'
import { blueprint } from './blueprint'
import { circuit } from './circuit'
import { citymap } from './citymap'
import { hexes } from './hexes'
import { ledger } from './ledger'
import { monitor } from './monitor'
import { ocr } from './ocr'
import { pose } from './pose'
import { stars } from './stars'
import { steam } from './steam'

/** Every backdrop scene, by id. */
export const SCENES: Readonly<Record<SceneId, Scene>> = {
  pose,
  ledger,
  steam,
  citymap,
  ocr,
  monitor,
  blueprint,
  circuit,
  hexes,
  stars,
  aurora,
}

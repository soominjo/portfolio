import { SRGBColorSpace, TextureLoader, type Texture, type WebGLRenderer } from 'three'
import type { DeviceRig } from './deviceRig'
import type { DeviceSlide } from './deviceTypes'
import { clamp01, easeInOutCubic } from './motionMath'
import { coverTransform } from './screenFit'
import type { ScreenLayers } from './screenLayers'
import { createTextureCache, type TextureLoadFn } from './textureCache'

export interface ScreenFeedOptions {
  readonly loadTexture?: TextureLoadFn
  readonly createPlaceholder: (label: string) => Texture
  /** Called when a texture arrives later and the scene needs drawing again. */
  readonly onChange?: () => void
}

/** Puts each slide's screenshots on the laptop and phone screens. */
export interface ScreenFeed {
  show(slide: DeviceSlide, immediate: boolean): void
  prefetch(slides: readonly DeviceSlide[]): void
  /** Advances cross-fades; true while one is running. */
  update(nowMs: number): boolean
  dispose(): void
}

const FADE_MS = 350
const CACHE_SIZE = 6
// Phone shots are already phone-shaped; any sliver of extra width is cropped evenly.
const PHONE_FOCUS_X = 0.5

interface ScreenSlot {
  readonly layers: ScreenLayers
  readonly aspect: number
  /** Start time of the running cross-fade; null = starts on the next update. */
  fade: { start: number | null } | null
}

function defaultLoader(): TextureLoadFn {
  const loader = new TextureLoader()
  return (url) => loader.loadAsync(url)
}

function imageAspect(texture: Texture, fallback: number): number {
  const image = texture.image as { width?: number; height?: number } | null
  return image?.width && image.height ? image.width / image.height : fallback
}

/** Crops the screenshot to the screen's shape and sets it up for sharp, correct colour. */
function fitToScreen(texture: Texture, screenAspect: number, focusX: number, renderer: WebGLRenderer): Texture {
  const fit = coverTransform(imageAspect(texture, screenAspect), screenAspect, focusX)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
  texture.repeat.set(fit.repeatX, fit.repeatY)
  texture.offset.set(fit.offsetX, fit.offsetY)
  return texture
}

function settle(slot: ScreenSlot): void {
  slot.layers.setFade(1)
  slot.layers.commit()
  slot.fade = null
}

export function createScreenFeed(renderer: WebGLRenderer, rig: DeviceRig, options: ScreenFeedOptions): ScreenFeed {
  const cache = createTextureCache(options.loadTexture ?? defaultLoader(), CACHE_SIZE)
  const placeholders = new Map<string, Texture>()
  const laptop: ScreenSlot = { layers: rig.laptop.screen, aspect: rig.laptop.screenAspect, fade: null }
  const phone: ScreenSlot = { layers: rig.phone.screen, aspect: rig.phone.screenAspect, fade: null }
  let token = 0
  let disposed = false

  const placeholderFor = (label: string): Texture => {
    const texture = placeholders.get(label) ?? options.createPlaceholder(label)
    placeholders.set(label, texture)
    return texture
  }

  // Only the newest slide's textures land; anything older that resolves late is dropped.
  const present = (slot: ScreenSlot, texture: Texture, slideToken: number, immediate: boolean) => {
    if (disposed || slideToken !== token || slot.layers.displayed().at(-1) === texture) return
    if (slot.fade) settle(slot)
    renderer.initTexture(texture)
    slot.layers.show(texture)
    if (immediate) settle(slot)
    else if (slot.layers.displayed().length > 1) slot.fade = { start: null }
    cache.pin([...laptop.layers.displayed(), ...phone.layers.displayed()])
    options.onChange?.()
  }

  const load = (slot: ScreenSlot, url: string | null, focusX: number, label: string, immediate: boolean) => {
    const slideToken = token
    if (url === null) return present(slot, placeholderFor(label), slideToken, immediate)
    cache.get(url).then(
      (texture) => present(slot, fitToScreen(texture, slot.aspect, focusX, renderer), slideToken, immediate),
      () => present(slot, placeholderFor(label), slideToken, immediate),
    )
  }

  return {
    show(slide, immediate) {
      token += 1
      load(laptop, slide.desktopUrl, slide.desktopFocusX, slide.label, immediate)
      if (slide.showPhone) load(phone, slide.mobileUrl, PHONE_FOCUS_X, slide.label, immediate)
    },
    prefetch(slides) {
      const urls = slides.flatMap((slide) => [slide.desktopUrl, slide.showPhone ? slide.mobileUrl : null])
      cache.prefetch(urls.filter((url): url is string => url !== null))
    },
    update(nowMs) {
      let fading = false
      for (const slot of [laptop, phone]) {
        if (!slot.fade) continue
        slot.fade.start ??= nowMs
        const t = clamp01((nowMs - slot.fade.start) / FADE_MS)
        slot.layers.setFade(easeInOutCubic(t))
        if (t < 1) fading = true
        else settle(slot)
      }
      return fading
    },
    dispose() {
      disposed = true
      cache.dispose()
      for (const texture of placeholders.values()) texture.dispose()
      placeholders.clear()
    },
  }
}

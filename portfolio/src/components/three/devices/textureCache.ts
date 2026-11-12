import type { Texture } from 'three'

export type TextureLoadFn = (url: string) => Promise<Texture>

/** Screenshot textures by URL, keeping only the most recently used on the GPU. */
export interface TextureCache {
  get(url: string): Promise<Texture>
  /** Starts loading in the background; failures stay silent. */
  prefetch(urls: readonly string[]): void
  /** Textures on screen right now, which must never be evicted. */
  pin(textures: readonly Texture[]): void
  dispose(): void
}

interface Entry {
  readonly promise: Promise<Texture>
  texture: Texture | null
}

/** An LRU cache: past `maxEntries`, the least recently used unpinned texture is disposed. */
export function createTextureCache(load: TextureLoadFn, maxEntries: number): TextureCache {
  // Map order is recency order: a hit is deleted and re-inserted at the end.
  const entries = new Map<string, Entry>()
  let pinned: ReadonlySet<Texture> = new Set()
  let disposed = false

  // Only finished textures count toward the limit, and the one that just
  // finished is never evicted: its caller is about to put it on screen.
  const evict = (justLoaded: string) => {
    let finished = [...entries.values()].filter((entry) => entry.texture !== null).length
    for (const [url, entry] of entries) {
      if (finished <= maxEntries) return
      if (url === justLoaded || entry.texture === null || pinned.has(entry.texture)) continue
      entries.delete(url)
      entry.texture.dispose()
      finished -= 1
    }
  }

  const startLoad = (url: string): Entry => {
    const entry: Entry = {
      texture: null,
      promise: load(url).then((texture) => {
        entry.texture = texture
        if (disposed) texture.dispose()
        else evict(url)
        return texture
      }),
    }
    // A failed load is forgotten so the next request tries again.
    entry.promise.catch(() => {
      if (entries.get(url) === entry) entries.delete(url)
    })
    return entry
  }

  const get = (url: string): Promise<Texture> => {
    const entry = entries.get(url) ?? startLoad(url)
    entries.delete(url)
    entries.set(url, entry)
    return entry.promise
  }

  return {
    get,
    prefetch(urls) {
      for (const url of urls) get(url).catch(() => undefined)
    },
    pin(textures) {
      pinned = new Set(textures)
    },
    dispose() {
      disposed = true
      for (const entry of entries.values()) entry.texture?.dispose()
      entries.clear()
    },
  }
}

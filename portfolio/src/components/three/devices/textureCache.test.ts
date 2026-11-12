import { Texture } from 'three'
import { describe, expect, it, vi } from 'vitest'
import { createTextureCache } from './textureCache'

function loader() {
  const made = new Map<string, Texture>()
  const load = vi.fn(async (url: string) => {
    const texture = new Texture()
    vi.spyOn(texture, 'dispose')
    made.set(url, texture)
    return texture
  })
  return { load, made }
}

describe('createTextureCache', () => {
  it('loads each url once', async () => {
    const { load } = loader()
    const cache = createTextureCache(load, 4)
    const [first, second] = await Promise.all([cache.get('a'), cache.get('a')])
    expect(load).toHaveBeenCalledTimes(1)
    expect(first).toBe(second)
  })

  it('evicts and disposes the least recently used texture', async () => {
    const { load, made } = loader()
    const cache = createTextureCache(load, 2)
    await cache.get('a')
    await cache.get('b')
    await cache.get('c')
    expect(made.get('a')?.dispose).toHaveBeenCalled()
    expect(made.get('b')?.dispose).not.toHaveBeenCalled()
  })

  it('counts a repeat request as recent use', async () => {
    const { load, made } = loader()
    const cache = createTextureCache(load, 2)
    await cache.get('a')
    await cache.get('b')
    await cache.get('a')
    await cache.get('c')
    expect(made.get('a')?.dispose).not.toHaveBeenCalled()
    expect(made.get('b')?.dispose).toHaveBeenCalled()
  })

  it('never evicts a pinned texture', async () => {
    const { load, made } = loader()
    const cache = createTextureCache(load, 2)
    cache.pin([await cache.get('a')])
    await cache.get('b')
    await cache.get('c')
    expect(made.get('a')?.dispose).not.toHaveBeenCalled()
    expect(made.get('b')?.dispose).toHaveBeenCalled()
  })

  it('keeps a texture that finishes while older loads are still pending', async () => {
    const finished = new Texture()
    vi.spyOn(finished, 'dispose')
    const load = vi.fn((url: string) => (url === 'c' ? Promise.resolve(finished) : new Promise<Texture>(() => {})))
    const cache = createTextureCache(load, 2)
    void cache.get('a')
    void cache.get('b')
    expect(await cache.get('c')).toBe(finished)
    expect(finished.dispose).not.toHaveBeenCalled()
    await cache.get('c')
    expect(load).toHaveBeenCalledTimes(3)
  })

  it('retries a load that failed', async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error('404')).mockResolvedValueOnce(new Texture())
    const cache = createTextureCache(load, 2)
    await expect(cache.get('x')).rejects.toThrow('404')
    await expect(cache.get('x')).resolves.toBeInstanceOf(Texture)
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('prefetches without surfacing failures', async () => {
    const load = vi.fn().mockRejectedValue(new Error('offline'))
    const cache = createTextureCache(load, 2)
    expect(() => cache.prefetch(['x', 'y'])).not.toThrow()
    await Promise.resolve()
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('disposes everything it holds, including late arrivals', async () => {
    const { load, made } = loader()
    let finishLate: (texture: Texture) => void = () => {}
    const late = new Texture()
    vi.spyOn(late, 'dispose')
    const cache = createTextureCache((url) => (url === 'late' ? new Promise((resolve) => (finishLate = resolve)) : load(url)), 4)
    await cache.get('a')
    const pending = cache.get('late')
    cache.dispose()
    finishLate(late)
    await pending
    expect(made.get('a')?.dispose).toHaveBeenCalled()
    expect(late.dispose).toHaveBeenCalled()
  })
})

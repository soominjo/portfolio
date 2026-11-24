import { afterEach, describe, expect, it } from 'vitest'
import rocketLitPng2x from '../../assets/cursors/rocket-lit@2x.png?inline'
import rocketLitPng from '../../assets/cursors/rocket-lit.png?inline'
import rocketLitSvg from '../../assets/cursors/rocket-lit.svg?raw'
import rocketPng2x from '../../assets/cursors/rocket@2x.png?inline'
import rocketPng from '../../assets/cursors/rocket.png?inline'
import rocketSvg from '../../assets/cursors/rocket.svg?raw'
import css from '../../index.css?raw'
import {
  cursorZone,
  EXHAUST_QUERY,
  LIT_SELECTOR,
  ROCKET_CURSOR_CLASS,
  ROCKET_CURSOR_QUERY,
  TEXT_FIELD_SELECTOR,
} from './cursorRules'
import { ROCKET_HOTSPOT } from './exhaust'

function place(html: string): HTMLElement {
  document.body.innerHTML = html
  return document.body.firstElementChild as HTMLElement
}

describe('cursorZone', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('flies the plain rocket over ordinary content', () => {
    expect(cursorZone(place('<p>Hello</p>'))).toBe('rocket')
    expect(cursorZone(place('<a>no href</a>'))).toBe('rocket')
  })

  it('flies the plain rocket when there is no element under the pointer', () => {
    expect(cursorZone(null)).toBe('rocket')
    expect(cursorZone(window)).toBe('rocket')
  })

  it('lights the engine over links and buttons, including what is inside them', () => {
    expect(cursorZone(place('<a href="#about">About</a>'))).toBe('lit')
    const icon = place('<button type="button"><svg><path /></svg></button>').querySelector('path')
    expect(cursorZone(icon)).toBe('lit')
    expect(cursorZone(place('<input type="submit" value="Send" />'))).toBe('lit')
    expect(cursorZone(place('<label for="name">Name</label>'))).toBe('lit')
    expect(cursorZone(place('<div class="cursor-pointer">Segment</div>'))).toBe('lit')
  })

  it('stays quiet over text fields, which keep the I-beam', () => {
    expect(cursorZone(place('<input type="text" />'))).toBe('other')
    expect(cursorZone(place('<input type="email" />'))).toBe('other')
    expect(cursorZone(place('<input />'))).toBe('other')
    expect(cursorZone(place('<textarea></textarea>'))).toBe('other')
  })

  it("stays quiet over other inputs, which keep the browser's own cursor", () => {
    expect(cursorZone(place('<input type="checkbox" />'))).toBe('other')
    expect(cursorZone(place('<input type="range" />'))).toBe('other')
    expect(cursorZone(place('<input type="file" />'))).toBe('other')
  })

  it('stays quiet over disabled controls', () => {
    expect(cursorZone(place('<button type="button" disabled>Send</button>'))).toBe('other')
  })
})

describe('rocket cursor styles in index.css', () => {
  it('swaps the cursor only on mouse screens outside high-contrast mode', () => {
    expect(css).toContain(`@media ${ROCKET_CURSOR_QUERY} {`)
  })

  it('keeps the exhaust off for people who ask for less motion', () => {
    expect(EXHAUST_QUERY).toBe(`${ROCKET_CURSOR_QUERY} and (prefers-reduced-motion: no-preference)`)
  })

  it('lights the rocket on exactly the controls the exhaust treats as lit', () => {
    expect(css).toContain(`html.${ROCKET_CURSOR_CLASS} :is(${LIT_SELECTOR}):not(:disabled) {`)
  })

  it('keeps the I-beam on exactly the fields the exhaust skips', () => {
    expect(css).toContain(`html.${ROCKET_CURSOR_CLASS} :is(${TEXT_FIELD_SELECTOR}) {`)
  })

  it('puts the click point on the rocket nose in every cursor image', () => {
    const hotspot = `${ROCKET_HOTSPOT.x} ${ROCKET_HOTSPOT.y}`
    expect(css).toContain(`url('./assets/cursors/rocket.png') ${hotspot}, auto;`)
    expect(css).toContain(`url('./assets/cursors/rocket@2x.png') 2x) ${hotspot}, auto;`)
    expect(css).toContain(`url('./assets/cursors/rocket-lit.png') ${hotspot}, pointer;`)
    expect(css).toContain(`url('./assets/cursors/rocket-lit@2x.png') 2x) ${hotspot}, pointer;`)
  })
})

describe('rocket cursor art', () => {
  // A PNG stores its width and height as big-endian numbers at bytes 16 and 20.
  function pngSize(dataUrl: string): { width: number; height: number } {
    const bytes = atob(dataUrl.slice(dataUrl.indexOf(',') + 1))
    const uint32 = (at: number) =>
      ((bytes.charCodeAt(at) << 24) |
        (bytes.charCodeAt(at + 1) << 16) |
        (bytes.charCodeAt(at + 2) << 8) |
        bytes.charCodeAt(at + 3)) >>>
      0
    return { width: uint32(16), height: uint32(20) }
  }

  it.each([
    { name: 'rocket', svg: rocketSvg, png: rocketPng, png2x: rocketPng2x },
    { name: 'rocket-lit', svg: rocketLitSvg, png: rocketLitPng, png2x: rocketLitPng2x },
  ])('keeps $name within 32px, the largest cursor browsers show everywhere', ({ svg, png, png2x }) => {
    expect(svg).toContain('width="32" height="32"')
    expect(pngSize(png)).toEqual({ width: 32, height: 32 })
    expect(pngSize(png2x)).toEqual({ width: 64, height: 64 })
  })
})

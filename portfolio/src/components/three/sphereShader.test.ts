import { ShaderLib } from 'three'
import { describe, expect, it } from 'vitest'
import { patchPhongShader } from './sphereShader'

// three's own phong source, so these tests break if an upgrade moves an anchor.
const phong = {
  vertexShader: ShaderLib.phong.vertexShader,
  fragmentShader: ShaderLib.phong.fragmentShader,
}

describe('patchPhongShader', () => {
  it("adds noise displacement to three's phong vertex shader", () => {
    const { vertexShader } = patchPhongShader(phong)
    expect(vertexShader).toContain('float turbulence(vec3 p)')
    expect(vertexShader).toContain(
      'gl_Position = projectionMatrix * modelViewMatrix * vec4((position + normal) + displacement, 1.0);',
    )
  })

  it('swaps the flat diffuse colour for the palette', () => {
    const { fragmentShader } = patchPhongShader(phong)
    expect(fragmentShader).toContain('uniform vec3 uColorPrimary;')
    expect(fragmentShader).not.toContain('vec4 diffuseColor = vec4( diffuse, opacity );')
  })

  it("fails loudly when three's shader layout changes", () => {
    expect(() =>
      patchPhongShader({ vertexShader: 'void main() {}', fragmentShader: 'void main() {}' }),
    ).toThrow('Sphere shader anchor not found: #include <common>')
  })

  it('leaves the hero displacement unchanged by default', () => {
    expect(patchPhongShader(phong).vertexShader).toContain('vec3 displacement = position * vNoise;')
  })

  it('scales the displacement when asked', () => {
    const { vertexShader } = patchPhongShader(phong, { displacementScale: 0.55 })
    expect(vertexShader).toContain('vec3 displacement = position * vNoise * 0.550;')
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects a displacement scale of %s', (scale) => {
    expect(() => patchPhongShader(phong, { displacementScale: scale })).toThrow(RangeError)
  })
})

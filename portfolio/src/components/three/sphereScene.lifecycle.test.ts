import {
  MeshPhongMaterial,
  PerspectiveCamera,
  ShaderLib,
  SphereGeometry,
  Vector3,
  type IUniform,
  type Light,
  type Mesh,
  type WebGLProgramParametersWithUniforms,
  type WebGLRenderer,
} from 'three'
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { createSphereScene, type SphereScene } from './sphereScene'

interface FakeRenderer {
  outputColorSpace: string
  setSize: Mock
  setPixelRatio: Mock
  render: Mock
  dispose: Mock
}

const { renderers } = vi.hoisted(() => ({ renderers: [] as FakeRenderer[] }))

// Everything in three stays real except the renderer, which needs WebGL.
vi.mock('three', async (importOriginal) => {
  const actual = await importOriginal<typeof import('three')>()
  class FakeWebGLRenderer implements FakeRenderer {
    outputColorSpace = ''
    setSize = vi.fn()
    setPixelRatio = vi.fn()
    render = vi.fn()
    dispose = vi.fn()

    constructor() {
      renderers.push(this)
    }
  }
  return { ...actual, WebGLRenderer: FakeWebGLRenderer }
})

function sphereMesh(sphere: SphereScene): Mesh<SphereGeometry, MeshPhongMaterial> {
  return sphere.scene.children.find((child) => (child as Mesh).isMesh) as Mesh<
    SphereGeometry,
    MeshPhongMaterial
  >
}

// Runs the material's onBeforeCompile the way three would at first render.
function compileShader(sphere: SphereScene) {
  const shader = {
    uniforms: {} as Record<string, IUniform>,
    vertexShader: ShaderLib.phong.vertexShader,
    fragmentShader: ShaderLib.phong.fragmentShader,
  }
  sphereMesh(sphere).material.onBeforeCompile(
    shader as unknown as WebGLProgramParametersWithUniforms,
    renderers[0] as unknown as WebGLRenderer,
  )
  return shader
}

describe('createSphereScene with a renderer', () => {
  const canvas = document.createElement('canvas')

  beforeEach(() => {
    renderers.length = 0
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('keeps exactly two lights across theme changes', () => {
    const sphere = createSphereScene(canvas)!
    sphere.setTheme('dark')
    sphere.setTheme('light')
    expect(sphere.scene.children.filter((child) => (child as Light).isLight)).toHaveLength(2)
  })

  it('sizes the renderer and moves the sphere on resize', () => {
    const sphere = createSphereScene(canvas)!
    sphere.resize(800, 600)
    expect(renderers[0].setSize).toHaveBeenCalledWith(800, 600)
    const mesh = sphere.scene.children.find((child) => (child as Mesh).isMesh)!
    expect(mesh.position).toMatchObject({ x: 18, y: 14 })
  })

  it('feeds the brand palette into the compiled shader', () => {
    const shader = compileShader(createSphereScene(canvas)!)
    expect(shader.uniforms.uColorPrimary.value).toEqual(new Vector3(99 / 255, 102 / 255, 241 / 255))
    expect(shader.uniforms.uColorSecondary.value).toEqual(new Vector3(34 / 255, 211 / 255, 238 / 255))
    expect(shader.vertexShader).toContain('turbulence(')
  })

  it('advances the noise clock and spins the sphere on tick', () => {
    const sphere = createSphereScene(canvas)!
    const shader = compileShader(sphere)
    sphere.tick(1000, 0.2, 0.3)
    expect(shader.uniforms.time.value).toBeCloseTo(0.05)
    expect(sphereMesh(sphere).rotation).toMatchObject({ x: 0.2, y: 0.3 })
    expect(sphereMesh(sphere).rotation.z).toBeCloseTo(0.001)
  })

  it('draws the scene through its camera', () => {
    const sphere = createSphereScene(canvas)!
    sphere.render()
    expect(renderers[0].render).toHaveBeenCalledWith(sphere.scene, expect.any(PerspectiveCamera))
  })

  it('disposes the renderer, geometry and material', () => {
    const geometry = vi.spyOn(SphereGeometry.prototype, 'dispose')
    const material = vi.spyOn(MeshPhongMaterial.prototype, 'dispose')
    createSphereScene(canvas)!.dispose()
    expect(renderers[0].dispose).toHaveBeenCalled()
    expect(geometry).toHaveBeenCalled()
    expect(material).toHaveBeenCalled()
  })
})

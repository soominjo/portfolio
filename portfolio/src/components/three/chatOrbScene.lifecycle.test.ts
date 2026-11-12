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
import { createChatOrbScene, type ChatOrbScene } from './chatOrbScene'

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

function orbMesh(orb: ChatOrbScene): Mesh<SphereGeometry, MeshPhongMaterial> {
  return orb.scene.children.find((child) => (child as Mesh).isMesh) as Mesh<
    SphereGeometry,
    MeshPhongMaterial
  >
}

// Runs the material's onBeforeCompile the way three would at first render.
function compileShader(orb: ChatOrbScene) {
  const shader = {
    uniforms: {} as Record<string, IUniform>,
    vertexShader: ShaderLib.phong.vertexShader,
    fragmentShader: ShaderLib.phong.fragmentShader,
  }
  orbMesh(orb).material.onBeforeCompile(
    shader as unknown as WebGLProgramParametersWithUniforms,
    renderers[0] as unknown as WebGLRenderer,
  )
  return shader
}

describe('createChatOrbScene with a renderer', () => {
  const canvas = document.createElement('canvas')

  beforeEach(() => {
    renderers.length = 0
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('compiles the softer surface and the brand palette', () => {
    const shader = compileShader(createChatOrbScene(canvas)!)
    expect(shader.vertexShader).toContain('vec3 displacement = position * vNoise * 0.550;')
    expect(shader.uniforms.uColorPrimary.value).toEqual(new Vector3(99 / 255, 102 / 255, 241 / 255))
    expect(shader.uniforms.uColorSecondary.value).toEqual(new Vector3(34 / 255, 211 / 255, 238 / 255))
  })

  it('keeps exactly two lights across theme changes', () => {
    const orb = createChatOrbScene(canvas)!
    orb.setTheme('dark')
    orb.setTheme('light')
    expect(orb.scene.children.filter((child) => (child as Light).isLight)).toHaveLength(2)
  })

  it('renders crisp but caps the pixel ratio at 2', () => {
    createChatOrbScene(canvas)!.resize(72, 3)
    expect(renderers[0].setPixelRatio).toHaveBeenCalledWith(2)
    expect(renderers[0].setSize).toHaveBeenCalledWith(72, 72, false)
  })

  it('drifts, spins, breathes and leans on tick', () => {
    const orb = createChatOrbScene(canvas)!
    const shader = compileShader(orb)
    orb.tick(1000, { x: 0.5, y: -0.5 })
    const mesh = orbMesh(orb)
    expect(shader.uniforms.time.value).toBeCloseTo(0.09)
    expect(mesh.rotation.z).toBeCloseTo(0.09)
    expect(mesh.rotation.x).toBeCloseTo(-0.375)
    expect(mesh.rotation.y).toBeCloseTo(0.375)
    expect(mesh.position.x).toBeCloseTo(0.8)
    expect(mesh.position.y).toBeCloseTo(0.8)
    expect(mesh.scale.x).toBeCloseTo(1 + 0.02 * Math.sin(2))
  })

  it('draws the scene through its camera', () => {
    const orb = createChatOrbScene(canvas)!
    orb.render()
    expect(renderers[0].render).toHaveBeenCalledWith(orb.scene, expect.any(PerspectiveCamera))
  })

  it('disposes the renderer, geometry and material', () => {
    const geometry = vi.spyOn(SphereGeometry.prototype, 'dispose')
    const material = vi.spyOn(MeshPhongMaterial.prototype, 'dispose')
    createChatOrbScene(canvas)!.dispose()
    expect(renderers[0].dispose).toHaveBeenCalled()
    expect(geometry).toHaveBeenCalled()
    expect(material).toHaveBeenCalled()
  })
})

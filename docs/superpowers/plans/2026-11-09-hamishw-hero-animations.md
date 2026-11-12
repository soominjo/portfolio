# Hero Animations (hamishw.com-inspired) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port three hamishw.com animations into the hero: the katakana decoder name, the rotating role words, and the noise-displaced 3D sphere background. Restyle all three to this portfolio's own palette and layout.

**Architecture:** The two text effects become small reusable components in `src/components/motion/`, built on the framer-motion that's already installed. The sphere lives in `src/components/three/`. A pure shader-patch module and a framework-free scene module hold all three.js code, and a thin React component wires them to springs, viewport and theme. The hero lazy-loads it so three.js ships as its own chunk.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind v4, framer-motion 12 (installed), three 0.187 (new), Vitest 5 + Testing Library + jsdom (new, as specified in `docs/TDD.md`).

**Spec:** There's no separate design doc. On 2026-11-09 the user skipped the design questions and asked to start in the suggested order: text effects first, then the sphere, with the 3D device mockups later. Requirements come from the chat feasibility review and are fixed in Global Constraints below. Source being ported: https://github.com/HamishMW/portfolio (branch `master`, MIT).

## Global Constraints

- Run every npm command from `portfolio/`. Root `package.json` belongs to the Vercel API functions; don't touch it.
- TS config is strict about syntax: `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly` (no enums, namespaces or constructor parameter properties), `noUnusedLocals`, `noUnusedParameters`.
- New runtime dependency: `three@^0.187.0` only. New dev dependencies: `@types/three@^0.187.0`, `vitest@^5.1.0`, `@vitest/coverage-v8@^5.1.0`, `jsdom@^31.0.0`, `@testing-library/react@^16.3.3`, `@testing-library/dom@^10.4.2`, `@testing-library/jest-dom@^7.0.1`. No three-stdlib, no React Three Fiber.
- Palette and easing come from `docs/DESIGN.md`: indigo `#6366f1`, indigo-light `#818cf8`, cyan `#22d3ee`, easing `[0.22, 1, 0.36, 1]`. Light theme uses the existing `light:` Tailwind variant.
- Every effect honours `prefers-reduced-motion` through framer-motion `useReducedMotion()`.
- three.js may only be imported by files in `src/components/three/`, and the hero loads them through `React.lazy`.
- Restyle, don't clone: keep the existing centered hero layout and copy, and never reuse Hamish's text, projects or images.
- Each file ported from Hamish's repo starts with: `// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.`
- No `innerHTML`. No `console.log`.
- Never commit unless the user asks. Each task ends with a green checkpoint plus a suggested conventional-commit message for later, used on a `feat/hero-animations` branch.

## Review Focus

1. **WebGL blocked or software-only (old phones, some corporate laptops, `failIfMajorPerformanceCaveat`).** The hero must still show text, grid and blobs, with no error. Pinned in Task 4 (`returns null when WebGL is unavailable`) and Task 5 (`renders nothing when WebGL is unavailable`).
2. **Reduced motion.** The name appears instantly, words don't rotate, and the sphere draws one still frame. Pinned in Tasks 1, 2 and 5.
3. **Theme toggled while the sphere runs.** Lights swap without rebuilding the WebGL scene. Pinned in Task 4 (`keeps exactly two lights across theme changes`) and Task 5 (`creates the scene once and swaps lights on theme change`).
4. **Hero scrolled off-screen.** The render loop stops to save battery. Pinned in Task 5 (`draws one frame and starts no loop while off-screen`).
5. **360px phones.** The giant decoding name must not shift the centered layout while glyphs swap. Pinned in Task 1 (`reserves the final text width with an invisible sizer`). Horizontal overflow is clipped by the hero's existing `overflow-hidden`, but jsdom can't measure layout, so also check by eye at 360px during final verification.

---

### Task 1: Vitest harness + DecoderText

**Files:**
- Modify: `portfolio/package.json` (dev deps; scripts `"test": "vitest run"`, `"test:watch": "vitest"`, `"coverage": "vitest run --coverage"`)
- Create: `portfolio/vitest.config.ts`
- Create: `portfolio/src/test/controls.ts`, `portfolio/src/test/setup.ts`
- Create: `portfolio/THIRD_PARTY_NOTICES.md`
- Create: `portfolio/src/components/motion/decoder.ts`, `portfolio/src/components/motion/DecoderText.tsx`
- Modify: `portfolio/src/index.css` (add `.font-glyph` after `.font-mono-label`)
- Test: `portfolio/src/components/motion/decoder.test.ts`, `portfolio/src/components/motion/DecoderText.test.tsx`

**Interfaces:**
- Produces (test harness): `src/test/controls.ts` exports `reducedMotion: { value: boolean }` and `intersection: { isIntersecting: boolean }`. `setup.ts` resets both to `false` after each test. It also mocks framer-motion's `useReducedMotion` to return `reducedMotion.value` (all other framer-motion exports stay real). It installs an `IntersectionObserver` stub whose `observe(target)` queues one microtask callback with `{ isIntersecting: intersection.isIntersecting, target }`, and stubs `HTMLCanvasElement.prototype.getContext` to return `null`.
- Produces: `type CharType = 'glyph' | 'value'`, `interface DecoderChar { readonly type: CharType; readonly value: string }`, `const GLYPHS: readonly string[]`, `function shuffle(content: readonly string[], previous: readonly DecoderChar[], position: number, random?: () => number): DecoderChar[]`
- Produces: `function DecoderText({ text, delayMs = 0, className }: DecoderTextProps): JSX.Element` with DOM test ids `decoder-sizer` and `decoder-output`

- [ ] **Step 1: Install the test toolchain**

Run: `npm install -D vitest@^5.1.0 @vitest/coverage-v8@^5.1.0 jsdom@^31.0.0 @testing-library/react@^16.3.3 @testing-library/dom@^10.4.2 @testing-library/jest-dom@^7.0.1`
Expected: packages added, no `ERESOLVE` peer errors.

- [ ] **Step 2: Create `vitest.config.ts` and the harness**

`vitest.config.ts`: `mergeConfig(viteConfig, defineConfig({ test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], coverage: { provider: 'v8', include: ['src/components/motion/**', 'src/components/three/**', 'src/components/sections/Hero.tsx'], thresholds: { lines: 80, functions: 80, branches: 80, statements: 80 } } } }))`. `setup.ts` imports `@testing-library/jest-dom/vitest`, calls `cleanup()` after each test, and implements the controls listed above. Add the three npm scripts.

- [ ] **Step 3: Write the failing `shuffle` tests** (`decoder.test.ts`, `random = () => 0` always picks `GLYPHS[0]` = `'ア'`)

```ts
it('reveals characters before the position as their real values', () => {
  expect(shuffle([...'Gen'], [], 1.2, random)).toEqual([
    { type: 'value', value: 'G' }, { type: 'value', value: 'e' }, { type: 'glyph', value: 'ア' },
  ])
})
it('keeps the previous glyph while the fractional position is 0.5 or more', () => {
  const previous = [{ type: 'glyph', value: 'カ' }, { type: 'glyph', value: 'キ' }, { type: 'glyph', value: 'ク' }] as const
  expect(shuffle([...'Gen'], previous, 0.6, random)).toEqual([
    { type: 'value', value: 'G' }, { type: 'glyph', value: 'キ' }, { type: 'glyph', value: 'ク' },
  ])
})
it('keeps spaces as spaces', () => {
  expect(shuffle([...'a b'], [], 0, random)[1]).toEqual({ type: 'value', value: ' ' })
})
it('falls back to a random glyph when there is no previous glyph', () => {
  expect(shuffle([...'ab'], [], 0.5, random)[1]).toEqual({ type: 'glyph', value: 'ア' })
})
it('only ever uses katakana from GLYPHS', () => {
  expect(shuffle([...'Contreras'], [], 0).every((c) => GLYPHS.includes(c.value))).toBe(true)
})
```

- [ ] **Step 4: Run to verify they fail**

Run: `npx vitest run src/components/motion/decoder.test.ts`
Expected: FAIL, `Cannot find module './decoder'`.

- [ ] **Step 5: Implement `decoder.ts`**

`GLYPHS` = the 74-entry katakana array copied verbatim from https://raw.githubusercontent.com/HamishMW/portfolio/master/app/components/decoder-text/decoder-text.jsx. `shuffle` follows Hamish's rule: index `< position` → value; otherwise `position % 1 < 0.5` → random glyph (`GLYPHS[Math.floor(random() * GLYPHS.length)]`), else the previous glyph. Two additions: spaces always stay values, and a missing previous entry falls back to a random glyph. Default `random = Math.random`. Return a new array.

- [ ] **Step 6: Run to verify they pass**

Run: `npx vitest run src/components/motion/decoder.test.ts`
Expected: 5 passed.

- [ ] **Step 7: Write the failing `DecoderText` tests**

```tsx
it('gives assistive tech the real text only', () => {
  render(<h1><DecoderText text="Genessis" /></h1>)
  expect(screen.getByRole('heading', { name: 'Genessis' })).toBeInTheDocument()
})
it('reserves the final text width with an invisible sizer', () => {
  render(<DecoderText text="Genessis" />)
  const sizer = screen.getByTestId('decoder-sizer')
  expect(sizer).toHaveTextContent('Genessis')
  expect(sizer).toHaveClass('invisible')
  expect(sizer).toHaveAttribute('aria-hidden', 'true')
})
it('starts empty until the delay elapses', () => {
  render(<DecoderText text="Genessis" delayMs={5000} />)
  expect(screen.getByTestId('decoder-output')).toBeEmptyDOMElement()
})
it('decodes into the final text after the delay', async () => {
  render(<DecoderText text="Genessis" delayMs={50} />)
  await waitFor(() => expect(screen.getByTestId('decoder-output')).toHaveTextContent('Genessis'), { timeout: 4000 })
})
it('shows the final text at once when reduced motion is preferred', () => {
  reducedMotion.value = true
  render(<DecoderText text="Genessis" delayMs={5000} />)
  expect(screen.getByTestId('decoder-output')).toHaveTextContent('Genessis')
})
```

- [ ] **Step 8: Run to verify they fail**

Run: `npx vitest run src/components/motion/DecoderText.test.tsx`
Expected: FAIL, `Cannot find module './DecoderText'`.

- [ ] **Step 9: Implement `DecoderText.tsx`**

- **Spring:** `useSpring(0, { stiffness: 8, damping: 5 })`. An effect subscribes with `spring.on('change', p => setChars(prev = shuffle(content, prev, p)))` and starts with `setTimeout(() => spring.set(content.length), delayMs)`. Cleanup unsubscribes and clears the timer.
- **Reduced motion:** derive the output from `text` during render instead of setting state in the effect. The `react-hooks` v7 lint rules forbid synchronous setState in effects.
- **DOM:** wrapper `relative inline-block {className}` containing three children:
  - `<span className="sr-only">{text}</span>`
  - the sizer: `aria-hidden` `invisible`
  - the output: `aria-hidden` `absolute inset-0 flex justify-center whitespace-nowrap`. Glyph spans get `font-glyph font-normal opacity-80`.

- [ ] **Step 10: Run to verify they pass**

Run: `npx vitest run src/components/motion`
Expected: 10 passed.

- [ ] **Step 11: Add `.font-glyph` and the notices file**

`index.css`: `.font-glyph { font-family: 'Hiragino Sans', 'Yu Gothic', 'Meiryo', 'Noto Sans JP', sans-serif; }`. `THIRD_PARTY_NOTICES.md` contains two notices:
- Hamish's LICENSE, verbatim from https://raw.githubusercontent.com/HamishMW/portfolio/master/LICENSE
- the webgl-noise notice: MIT, Copyright (c) 2011 Stefan Gustavson / Ashima Arts, https://github.com/ashima/webgl-noise

- [ ] **Step 12: Checkpoint**

Run: `npm test && npm run lint`
Expected: all tests pass, 0 lint errors. Suggested commit: `feat: add decoder text animation and vitest harness`

---

### Task 2: RotatingWords

**Files:**
- Create: `portfolio/src/components/motion/RotatingWords.tsx`
- Test: `portfolio/src/components/motion/RotatingWords.test.tsx`

**Interfaces:**
- Consumes: `reducedMotion` from `src/test/controls.ts` (Task 1)
- Produces: `function RotatingWords({ words, intervalMs = 5000, className }: RotatingWordsProps): JSX.Element` with `words: readonly string[]`. Every rendered word element carries `data-testid="rotating-word"` and `data-present="true" | "false"` (from `useIsPresent()`).

- [ ] **Step 1: Write the failing tests** (fake timers; `WORDS = ['Full-Stack', 'Generative AI', 'QA Mindset']`; `current()` = the `rotating-word` with `data-present="true"`)

```tsx
it('shows the first word initially', () => { render(<RotatingWords words={WORDS} />); expect(current()).toHaveTextContent('Full-Stack') })
it('advances to the next word after the interval', () => {
  render(<RotatingWords words={WORDS} />); act(() => { vi.advanceTimersByTime(5000) })
  expect(current()).toHaveTextContent('Generative AI')
})
it('wraps back to the first word after the last one', () => {
  render(<RotatingWords words={WORDS} />); act(() => { vi.advanceTimersByTime(15000) })
  expect(current()).toHaveTextContent('Full-Stack')
})
it('honours a custom interval', () => {
  render(<RotatingWords words={WORDS} intervalMs={1000} />); act(() => { vi.advanceTimersByTime(1000) })
  expect(current()).toHaveTextContent('Generative AI')
})
it('keeps the first word when reduced motion is preferred', () => {
  reducedMotion.value = true
  render(<RotatingWords words={WORDS} />); act(() => { vi.advanceTimersByTime(15000) })
  expect(screen.getAllByTestId('rotating-word')).toHaveLength(1)
  expect(current()).toHaveTextContent('Full-Stack')
})
it('lists every word for assistive tech', () => {
  render(<RotatingWords words={WORDS} />)
  expect(screen.getByText('Full-Stack, Generative AI, and QA Mindset')).toHaveClass('sr-only')
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/motion/RotatingWords.test.tsx`
Expected: FAIL, `Cannot find module './RotatingWords'`.

- [ ] **Step 3: Implement `RotatingWords.tsx`**

- **Interval:** `setInterval` advances `index` with `(i + 1) % words.length`. Skip it when reduced motion is on or there are fewer than 2 words.
- **Screen readers:** an sr-only `new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format(words)`.
- **Visual:** an `aria-hidden` `grid` wrapping `<AnimatePresence>`. Each word is a `motion.span` in `col-start-1 row-start-1 justify-self-center`. On exit it fades: `{ opacity: 0, transition: { duration: 0.5, delay: 0.4 } }`.
- **Reveal** (only when motion is allowed):
  - The text animates `opacity: [0, 0, 1, 1]` at `times: [0, 0.5, 0.6, 1]`.
  - An absolutely positioned `bg-cyan-400 light:bg-cyan-600` block animates `clipPath: ['inset(0% 100% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 0% 100%)']` at `times: [0, 0.5, 1]`.
  - Both use `duration: 1.5`, `delay: 0.6` and the DESIGN.md easing.

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run src/components/motion`
Expected: 16 passed.

- [ ] **Step 5: Checkpoint**

Run: `npm test && npm run lint`
Expected: green. Suggested commit: `feat: add rotating words reveal animation`

---

### Task 3: Hero text integration

**Files:**
- Modify: `portfolio/src/components/sections/Hero.tsx:46-76` (name and role blocks)
- Test: `portfolio/src/components/sections/Hero.test.tsx`

**Interfaces:**
- Consumes: `DecoderText` (Task 1), `RotatingWords` (Task 2)
- Produces: the same `Hero()` signature. Task 5 adds the `theme` prop.

- [ ] **Step 1: Write the failing tests**

```tsx
it('renders the name as one level-one heading', () => {
  render(<Hero />)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  expect(screen.getByRole('heading', { level: 1, name: 'Genessis Contreras' })).toBeInTheDocument()
})
it('names the role and every discipline for assistive tech', () => {
  render(<Hero />)
  expect(screen.getByText('Software Engineer')).toBeInTheDocument()
  expect(screen.getByText('Full-Stack, Web & Mobile, Generative AI, and QA Mindset')).toHaveClass('sr-only')
})
it('keeps the calls to action', () => {
  render(<Hero />)
  expect(screen.getByRole('link', { name: 'View My Work' })).toHaveAttribute('href', '#projects')
  expect(screen.getByRole('link', { name: 'Get In Touch' })).toHaveAttribute('href', '#contact')
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/sections/Hero.test.tsx`
Expected: FAIL, 2 level-one headings found, and the disciplines text is missing.

- [ ] **Step 3: Rework the name and role blocks**

- **Name:** replace the two `motion.h1`s with one `<h1>` (classes from the first `h1`, minus `mb-2`, plus `mb-8`). Inside it, put two `motion.span className="block"` lines:
  - Keep `fadeUp` with `custom={0.1}` and `custom={0.2}`.
  - The first line gets `mb-2`. The second gets `glow-text` and `style={{ color: '#818cf8' }}`.
  - The lines wrap `<DecoderText text="Genessis" delayMs={300} />` and `<DecoderText text="Contreras" delayMs={500} />`, with `{' '}` between them so the accessible name has a space.
- **Role:** the role `motion.p` now holds two pieces:
  - `<span className="block">Software Engineer</span>`
  - `<span className="mt-3 flex items-center justify-center gap-3 text-cyan-400 light:text-cyan-700"><span aria-hidden="true" className="opacity-40">+</span><RotatingWords words={DISCIPLINES} /></span>`
- **Copy:** module constant `const DISCIPLINES = ['Full-Stack', 'Web & Mobile', 'Generative AI', 'QA Mindset'] as const`. This is the planner's call, taken from the hero's own copy.

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run src/components/sections/Hero.test.tsx`
Expected: 3 passed.

- [ ] **Step 5: Checkpoint**

Run: `npm test && npm run lint && npm run build`
Expected: green, build succeeds. Suggested commit: `feat: decode hero name and rotate role disciplines`

---

### Task 4: Sphere shader + scene core

**Files:**
- Modify: `portfolio/package.json` (`npm install three@^0.187.0 && npm install -D @types/three@^0.187.0`)
- Modify: `portfolio/src/hooks/useTheme.ts:4` (`export type Theme`)
- Create: `portfolio/src/components/three/sphereShader.ts`, `portfolio/src/components/three/sphereScene.ts`
- Test: `portfolio/src/components/three/sphereShader.test.ts`, `portfolio/src/components/three/sphereScene.test.ts`, `portfolio/src/components/three/sphereScene.lifecycle.test.ts`

**Interfaces:**
- Consumes: `Theme` from `src/hooks/useTheme.ts`
- Produces (`sphereShader.ts`):
  - `interface ShaderSource { readonly vertexShader: string; readonly fragmentShader: string }`
  - `function patchPhongShader(source: ShaderSource): ShaderSource`. Throws `Error('Sphere shader anchor not found: <anchor>')`.
  - `const SPHERE_PALETTE: { readonly primary: readonly [number, number, number]; readonly secondary: readonly [number, number, number] }`. Values: primary `[99/255, 102/255, 241/255]` (#6366f1), secondary `[34/255, 211/255, 238/255]` (#22d3ee).
- Produces (`sphereScene.ts`):
  - `getSpherePosition(viewportWidth: number): { x: number; y: number }`
  - `getLightIntensities(theme: Theme): { directional: number; ambient: number }`
  - `interface SphereScene { readonly scene: Scene; setTheme(theme: Theme): void; resize(width: number, height: number): void; tick(elapsedMs: number, rotationX: number, rotationY: number): void; render(): void; dispose(): void }`
  - `createSphereScene(canvas: HTMLCanvasElement): SphereScene | null`

- [ ] **Step 1: Install three and export `Theme`**

Run: `npm install three@^0.187.0 && npm install -D @types/three@^0.187.0`
Expected: added. Change `type Theme` to `export type Theme` in `useTheme.ts`.

- [ ] **Step 2: Write the failing tests**

`sphereShader.test.ts` (uses three's real `ShaderLib.phong` as `phong`):
```ts
it("adds noise displacement to three's phong vertex shader", () => {
  const { vertexShader } = patchPhongShader(phong)
  expect(vertexShader).toContain('float turbulence(vec3 p)')
  expect(vertexShader).toContain('gl_Position = projectionMatrix * modelViewMatrix * vec4((position + normal) + displacement, 1.0);')
})
it('swaps the flat diffuse colour for the palette', () => {
  const { fragmentShader } = patchPhongShader(phong)
  expect(fragmentShader).toContain('uniform vec3 uColorPrimary;')
  expect(fragmentShader).not.toContain('vec4 diffuseColor = vec4( diffuse, opacity );')
})
it("fails loudly when three's shader layout changes", () => {
  expect(() => patchPhongShader({ vertexShader: 'void main() {}', fragmentShader: 'void main() {}' }))
    .toThrow('Sphere shader anchor not found: #include <common>')
})
```
`sphereScene.test.ts` (real three, so jsdom has no WebGL):
```ts
it.each([[360, 14, 10], [767, 14, 10], [768, 18, 14], [1023, 18, 14], [1024, 22, 16], [1920, 22, 16]])(
  'positions the sphere for a %ipx viewport', (w, x, y) => expect(getSpherePosition(w)).toEqual({ x, y }))
it('uses brighter ambient light in the light theme', () => {
  expect(getLightIntensities('dark')).toEqual({ directional: 2, ambient: 0.4 })
  expect(getLightIntensities('light')).toEqual({ directional: 1.8, ambient: 2.7 })
})
it('returns null when WebGL is unavailable', () => {
  expect(createSphereScene(document.createElement('canvas'))).toBeNull()
})
```
`sphereScene.lifecycle.test.ts` (`vi.mock('three')` keeps everything real except a `FakeRenderer` with `vi.fn()` `setSize`, `setPixelRatio`, `render` and `dispose`, plus instances captured via `vi.hoisted`):
```ts
it('keeps exactly two lights across theme changes', () => {
  const s = createSphereScene(canvas)!; s.setTheme('dark'); s.setTheme('light')
  expect(s.scene.children.filter((c) => (c as Light).isLight)).toHaveLength(2)
})
it('sizes the renderer and moves the sphere on resize', () => {
  const s = createSphereScene(canvas)!; s.resize(800, 600)
  expect(renderers[0].setSize).toHaveBeenCalledWith(800, 600)
  expect(s.scene.children.find((c) => (c as Mesh).isMesh)!.position).toMatchObject({ x: 18, y: 14 })
})
it('disposes the renderer, geometry and material', () => {
  const geometry = vi.spyOn(SphereGeometry.prototype, 'dispose'); const material = vi.spyOn(MeshPhongMaterial.prototype, 'dispose')
  createSphereScene(canvas)!.dispose()
  expect(renderers[0].dispose).toHaveBeenCalled(); expect(geometry).toHaveBeenCalled(); expect(material).toHaveBeenCalled()
})
```

- [ ] **Step 3: Run to verify they fail**

Run: `npx vitest run src/components/three`
Expected: FAIL, modules not found.

- [ ] **Step 4: Implement `sphereShader.ts`**

`patchPhongShader` does string replacements on three's own phong source and throws if an anchor is missing. The noise source to paste: `mod289` (both overloads), `permute`, `taylorInvSqrt`, `fade`, `pnoise` and `turbulence`, verbatim from https://raw.githubusercontent.com/HamishMW/portfolio/master/app/routes/home/displacement-sphere-vertex.glsl. Keep Gustavson's MIT header, and drop the unused `cnoise`. Exact injections:

| Shader | Anchor | Insert / replace with |
|---|---|---|
| vertex | after `#include <common>` | `uniform float time;` `varying vec2 vNoiseUv;` `varying float vNoise;` + the noise source |
| vertex | after `#include <fog_vertex>` | `vNoiseUv = uv;` `vNoise = turbulence(0.01 * position + normal + time * 0.8);` `vec3 displacement = position * vNoise;` `gl_Position = projectionMatrix * modelViewMatrix * vec4((position + normal) + displacement, 1.0);` |
| fragment | after `#include <common>` | `uniform vec3 uColorPrimary;` `uniform vec3 uColorSecondary;` `varying vec2 vNoiseUv;` `varying float vNoise;` |
| fragment | replace `vec4 diffuseColor = vec4( diffuse, opacity );` | see block below |

```glsl
float tone = cos(4.5 * vNoise);                                        // Hamish's red channel: bright on smooth areas, dark in grooves
float detail = cos(vNoiseUv.x * (0.2 - 2.0 * vNoise) * vNoise * 3.0);  // Hamish's green/blue channel
vec3 paletteColor = mix(uColorSecondary, uColorPrimary, clamp(tone * 0.5 + 0.5, 0.0, 1.0));
vec4 diffuseColor = vec4(paletteColor * (0.75 + 0.25 * detail), opacity);
```

- [ ] **Step 5: Implement `sphereScene.ts`**

- **Hamish's values (`displacement-sphere.jsx`):**
  - Renderer: `{ canvas, antialias: false, alpha: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: true }`, `setPixelRatio(1)`, `outputColorSpace = LinearSRGBColorSpace`
  - Camera: `PerspectiveCamera(54, 1, 0.1, 100)` at `z = 52`
  - Geometry: `SphereGeometry(32, 128, 128)` with `MeshPhongMaterial`
  - Lights: `DirectionalLight(0xffffff, directional)` at `(100, 100, 200)` and `AmbientLight(0xffffff, ambient)`
- **Positions:** `getSpherePosition` uses Tailwind's breakpoints: `< 768` → `{14, 10}`, `< 1024` → `{18, 14}`, else `{22, 16}`.
- **Shader hookup:** `onBeforeCompile` adds `time` (a `{ value: 0 }` held by the scene) and the two palette uniforms to `shader.uniforms`, as `Vector3`. Raw sRGB values are correct because the output colour space is linear. It then assigns `patchPhongShader`'s strings.
- **Methods:**
  - `setTheme` removes the previous two lights before adding new ones.
  - `resize` sets the renderer size, camera aspect (plus `updateProjectionMatrix()`) and sphere position.
  - `tick` sets `time = 0.00005 * elapsedMs`, `rotation.z += 0.001`, `rotation.x = rotationX` and `rotation.y = rotationY`.
  - `dispose` disposes geometry, material and renderer.
- **No WebGL:** wrap `new WebGLRenderer` in try/catch and return `null` on failure.

- [ ] **Step 6: Run to verify they pass**

Run: `npx vitest run src/components/three`
Expected: 14 passed.

- [ ] **Step 7: Checkpoint**

Run: `npm test && npm run lint && npm run build`
Expected: green. Suggested commit: `feat: add displacement sphere shader and scene core`

---

### Task 5: DisplacementSphere component + hero wiring

**Files:**
- Create: `portfolio/src/components/three/DisplacementSphere.tsx`
- Modify: `portfolio/src/components/sections/Hero.tsx` (lazy sphere, `theme` prop)
- Modify: `portfolio/src/App.tsx:23` (`<Hero theme={theme} />`)
- Modify: `portfolio/src/components/sections/Hero.test.tsx` (render with `theme="dark"`)
- Modify: `docs/DESIGN.md` (Motion section)
- Test: `portfolio/src/components/three/DisplacementSphere.test.tsx`

**Interfaces:**
- Consumes: `createSphereScene`, `SphereScene` (Task 4). `Theme`. `intersection` and `reducedMotion` (Task 1).
- Produces: `export default function DisplacementSphere({ theme, className }: { theme: Theme; className?: string }): JSX.Element | null` and `Hero({ theme }: { theme: Theme })`

- [ ] **Step 1: Write the failing tests** (`vi.mock('./sphereScene')` keeps real exports except `createSphereScene`, which returns `fake`, a `SphereScene` of `vi.fn()`s, or `null`)

```tsx
it('renders nothing when WebGL is unavailable', async () => {
  vi.mocked(createSphereScene).mockReturnValue(null)
  const { container } = render(<DisplacementSphere theme="dark" />)
  await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
})
it('creates the scene once and swaps lights on theme change', () => {
  const { rerender } = render(<DisplacementSphere theme="dark" />); rerender(<DisplacementSphere theme="light" />)
  expect(createSphereScene).toHaveBeenCalledTimes(1); expect(fake.setTheme).toHaveBeenLastCalledWith('light')
})
it('disposes the scene on unmount', () => {
  const { unmount } = render(<DisplacementSphere theme="dark" />); unmount()
  expect(fake.dispose).toHaveBeenCalled()
})
it('draws one frame and starts no loop while off-screen', async () => {
  render(<DisplacementSphere theme="dark" />)
  await waitFor(() => expect(fake.render).toHaveBeenCalled()); expect(fake.tick).not.toHaveBeenCalled()
})
it('draws one still frame when reduced motion is preferred, even on-screen', async () => {
  reducedMotion.value = true; intersection.isIntersecting = true
  render(<DisplacementSphere theme="dark" />)
  await waitFor(() => expect(fake.render).toHaveBeenCalled()); expect(fake.tick).not.toHaveBeenCalled()
})
it('animates while on-screen', async () => {
  intersection.isIntersecting = true
  render(<DisplacementSphere theme="dark" />)
  await waitFor(() => expect(fake.tick).toHaveBeenCalled())
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/three/DisplacementSphere.test.tsx`
Expected: FAIL, `Cannot find module './DisplacementSphere'`.

- [ ] **Step 3: Implement `DisplacementSphere.tsx`**

- **Mount effect:** `createSphereScene(canvas)`. On `null`, set `failed` (return `null`). Otherwise keep the scene in a ref and `dispose` it on cleanup.
- **Theme effect:** calls `setTheme(theme)`.
- **Resize effect:** a window `resize` listener calls `resize(innerWidth, innerHeight * 1.3)` and runs once immediately. When reduced motion is on, also `render()` once.
- **Rotation:** springs `useSpring(0, { stiffness: 30, damping: 20, mass: 2 })` for x and y. While `useInView(canvasRef)` is true and reduced motion is off, a `mousemove` listener sets them to `clientY / innerHeight / 2` and `clientX / innerWidth / 2`.
- **Loop:** under the same condition, a `requestAnimationFrame` loop calls `tick(now - start, springX.get(), springY.get())` and `render()`. Otherwise call `render()` once.
- **Markup:** `<motion.canvas aria-hidden ref={canvasRef} className={className} initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }} />`.

- [ ] **Step 4: Wire it into the hero**

In Hero: `const DisplacementSphere = lazy(() => import('../three/DisplacementSphere'))`. Render `<Suspense fallback={null}><DisplacementSphere theme={theme} className="pointer-events-none absolute inset-0" /></Suspense>` right after the two gradient blobs. Hero takes `{ theme }: { theme: Theme }`, and App passes `theme`. Update `Hero.test.tsx` renders to `<Hero theme="dark" />`.

- [ ] **Step 5: Run to verify they pass**

Run: `npm test`
Expected: every suite passes (about 39 tests).

- [ ] **Step 6: Document the motion patterns**

Add three subsections to `docs/DESIGN.md` → Motion / Animation: **Decoder Text**, **Rotating Words** and **Displacement Sphere**. Each gets its usage line, the timing values above and its reduced-motion behaviour. End with `Adapted from Hamish Williams' portfolio (MIT) — see portfolio/THIRD_PARTY_NOTICES.md.`

- [ ] **Step 7: Checkpoint**

Run: `npm run coverage && npm run lint && npm run build`
Expected: coverage thresholds of 80% met. Lint clean. `dist/assets/` has a separate `DisplacementSphere-*.js` chunk holding three.js, and the main `index-*.js` chunk doesn't contain `WebGLRenderer`. Suggested commit: `feat: add displacement sphere hero background`

---

## Final verification (after Task 5)

- `npm run dev`, then look at the hero at 1440px and 360px, in dark and light themes, and with reduced motion emulated. Check that "Contreras" stays readable over the sphere. If not, lower the canvas opacity below `0.85` or shift `getSpherePosition` right.
- A fresh reviewer then checks the whole change.

## Out of scope (separate plan later)

- 3D phone/laptop mockups: this needs licensed `.glb` models, project screenshots, `GLTFLoader` and `DRACOLoader`.
- Applying any hamishw.com *pages*: brainstormed separately.

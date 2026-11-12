# Chatbot 3D Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the flat chat widget with a living 3D orb button and an angled "holo terminal" chat panel. While the chat is open, the orb becomes a close (×) mark. The panel lands tilted and turns to face the visitor once they engage with it.

**Architecture:**
- The orb reuses the hero sphere's shader in a small, framework-free three.js scene, which the launcher loads lazily over a CSS fallback orb.
- Chat state and the API call live in a hook.
- The terminal is a framer-motion panel whose 3D angle comes from a pure "pose" function fed by an engagement hook.
- Replies render as Markdown twice: a screen-reader copy, and a decoding copy whose text nodes are numbered by a tiny rehype plugin.
- `Chatbot.tsx` stays the entry point, so `App.tsx` doesn't change.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind v4, framer-motion 12, three 0.187, react-markdown 10, Vitest 5, Testing Library and jsdom. Everything is already installed.

**Spec:** `docs/superpowers/specs/2026-11-10-chatbot-3d-redesign-design.md`. Read it first; this plan argues from it.

**Visual reference:**
- `.superpowers/brainstorm/4118-1794302664/content/chat-combo.html`: the right-hand stage, "version 2", is the chosen design. Open it in a browser.
- Copy its look and motion, not its code. It uses `innerHTML`, katakana glyphs and canned answers.

## Global Constraints

**Setup and code rules**
- Run every npm command from `portfolio/`. The root `package.json` belongs to the Vercel API functions.
- No new dependencies. hast types come from `@types/hast`, which react-markdown already installs; use `import type` only.
- TypeScript: `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly` (no enums), `noUnusedLocals` and `noUnusedParameters`.
- Lint: `react-refresh/only-export-components` is on. `.tsx` files export only components and primitive constants; put objects, types and helpers in `.ts` files.
- three.js may only be imported by files in `src/components/three/`, and those load through `React.lazy`.
- No `innerHTML`, `dangerouslySetInnerHTML` or `console.log`.
- Credit: `chatOrbScene.ts` and `ChatOrb.tsx` start with `// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.`

**Look and motion**
- Colours:
  - indigo `#6366f1`
  - indigo-light `#818cf8`
  - cyan `#22d3ee`
  - light-theme cyan `#0891b2`
  - green `#4ade80`
- Easing: `[0.22, 1, 0.36, 1]`. The light theme uses the `light:` variant (the `.light` class on `<html>`).
- Fonts: `index.html` loads JetBrains Mono at 400 and 500 only, so mono labels use `font-normal` or `font-medium`, never bold.
- Reduced motion comes from framer-motion's `useReducedMotion()`. Tests flip it with `reducedMotion.value` from `src/test/controls.ts`.
- jsdom has no WebGL (`getContext` returns null), no `matchMedia`, no `ResizeObserver` and no `Element.scrollTo`. Scroll with `el.scrollTop = el.scrollHeight`.

**Copy (verbatim)**
- Welcome: `Hi! I'm Gens' AI assistant. Ask me anything about his experience, skills, or projects — I'm here to help!`
- Suggestions: `What does Gens build?`, `AI experience?`, `Open to work?`
- Header: `>` followed by `ask_genessis`
- Labels: `GENS.AI ›` and `YOU ›`
- Status: `ONLINE`, `INPUT`, `PROCESSING`
- Placeholder: `type a question…`
- Send key: `⏎ Enter`, with accessible name `Send message`
- Close: `[×]`, with accessible name `Close chat`
- Dialog name: `Ask about Genessis`
- Errors: `Error: <error>` and `Network error. Please try again.`

**API contract**
- Request: `POST /api/chat` with JSON `{ message, messages }`. `messages` holds the earlier turns without the welcome message, with roles `'user'` and `'model'`.
- Response: `{ success, reply?, error? }`.

**Shared working tree**
- Another Claude session (`portfolio-42`) works in this tree. Don't touch `Projects.tsx`, `ProjectCard.tsx`, `shared/types/project.ts`, `shared/data/projects.ts`, `src/components/projects/`, `src/components/three/devices/` or `public/projects/`.
- The controller messages `portfolio-42` before Task 1 (`sphereShader.ts`) and before Task 9 (`vitest.config.ts`, `THIRD_PARTY_NOTICES.md`, `docs/DESIGN.md`).
- Re-read any shared file right before editing it.
- Don't switch branches.
- Never commit unless Genessis asks. Each task ends with a green checkpoint and a suggested conventional-commit message.

## Review Focus

1. **A reply that arrives after the visitor closed the chat.** It must be in the conversation on reopen, with nothing lost or duplicated. Pinned in Task 8: `keeps a reply that arrives while the chat is closed`.
2. **The 3D orb can't load** (no WebGL, a software-only GPU, or the lazy chunk fails). The CSS orb stays and the button still opens the chat. Pinned in Task 8: `keeps the CSS orb and still opens the chat when the 3D orb fails`.
3. **A long, list-heavy reply** (1,500+ characters). The decode still ends within 2s, and the list layout is there from the first frame. Pinned in Task 5: `caps the decode at two seconds` and `finishes a long reply within two seconds and reports done once`.
4. **A reply containing HTML** (`<b>`, `<script>`). It is never rendered as HTML. Pinned in Task 5: `never renders HTML from a reply`.
5. **A short phone screen with the keyboard open.** The terminal fits between the top bar and the orb. Pinned in Task 8 (`caps the terminal height to the screen`) and checked by eye at 360×640 in Task 9.

---

### Task 1: Softer surface option for the shared sphere shader

**Files:**
- Modify: `portfolio/src/components/three/sphereShader.ts`
- Test: `portfolio/src/components/three/sphereShader.test.ts` (append)
- Modify: `.gitignore` (repo root): add a line `.superpowers/`

**Interfaces:**
- Produces:
  - `export interface PatchOptions { readonly displacementScale?: number }`
  - `export function patchPhongShader(source: ShaderSource, options?: PatchOptions): ShaderSource`

- [ ] **Step 1: Write the failing tests** (append inside `describe('patchPhongShader')`)

```ts
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
```

- [ ] **Step 2: Run the tests and check they fail**

Run: `npx vitest run src/components/three/sphereShader.test.ts`
Expected: the 2 new behaviour tests and the 4 `rejects` cases FAIL. The 3 existing tests PASS.

- [ ] **Step 3: Implement the option in `sphereShader.ts`**

Build the displacement line from the option:
- Omitted: keep `vec3 displacement = position * vNoise;` byte-identical, so the hero doesn't change.
- Otherwise: `position * vNoise * ${scale.toFixed(3)}`.
- Throw `RangeError` unless `Number.isFinite(scale) && scale > 0`.

- [ ] **Step 4: Run the tests and check they pass**

Run: `npx vitest run src/components/three/`
Expected: all tests PASS, including the hero sphere's.

- [ ] **Step 5: Add `.superpowers/` to the root `.gitignore`.** Then run `git status --short .superpowers` from the repo root. Expected: no output.

- [ ] **Step 6: Checkpoint.** Suggested commit: `feat: let the sphere shader soften its displacement`

---

### Task 2: Orb scene (`chatOrbScene.ts`)

**Files:**
- Create: `portfolio/src/components/three/chatOrbScene.ts`
- Test: `portfolio/src/components/three/chatOrbScene.test.ts`
- Test: `portfolio/src/components/three/chatOrbScene.lifecycle.test.ts`. Copy the fake-renderer harness from `sphereScene.lifecycle.test.ts`: the `vi.mock('three')` block, `renderers` and `compileShader`, plus `sphereMesh`, renamed `orbMesh`.

**Interfaces:**
- Consumes:
  - `patchPhongShader(source, { displacementScale })` and `SPHERE_PALETTE` from `./sphereShader`
  - `import type { LightIntensities } from './sphereScene'`
  - `import type { Theme } from '../../hooks/useTheme'`
- Produces:
  ```ts
  export interface Point { readonly x: number; readonly y: number }
  export interface OrbLean { readonly x: number; readonly y: number } // each in [-1, 1]
  export interface ChatOrbScene {
    readonly scene: Scene
    setTheme(theme: Theme): void
    resize(sizePx: number, devicePixelRatio: number): void
    tick(elapsedMs: number, lean: OrbLean): void
    render(): void
    dispose(): void
  }
  export function getOrbLightIntensities(theme: Theme): LightIntensities
  export function getOrbLean(pointer: Point, center: Point): OrbLean
  export function createChatOrbScene(canvas: HTMLCanvasElement): ChatOrbScene | null
  ```

**Values:**

| Setting | Value |
|---|---|
| Camera | fov 54, z 52 |
| Sphere | radius 17, 64×64 segments |
| `displacementScale` | 0.55 |
| Noise speed | 0.00009 per ms |
| Spin (rotation.z) | 0.00009 rad per ms |
| Lean angle | 0.75 rad |
| Lean offset | 1.6 units (x right, y up) |
| Breath | ±0.02 at 0.002 rad per ms |
| Lean range | 260px for a full lean; no lean beyond 400px |
| Lights, dark theme | `{ directional: 2.6, ambient: 1.1 }` |
| Lights, light theme | `{ directional: 1.8, ambient: 2.7 }` |
| Renderer | `alpha: true`, `antialias: true`, `failIfMajorPerformanceCaveat: true`, `LinearSRGBColorSpace` |

- [ ] **Step 1: Write the failing pure-function tests** (`chatOrbScene.test.ts`)

```ts
describe('getOrbLightIntensities', () => {
  it('lights the orb a little brighter than the hero in the dark theme', () => {
    expect(getOrbLightIntensities('dark')).toEqual({ directional: 2.6, ambient: 1.1 })
    expect(getOrbLightIntensities('light')).toEqual({ directional: 1.8, ambient: 2.7 })
  })
})

describe('getOrbLean', () => {
  const center = { x: 1000, y: 800 }
  it('stays upright when the pointer is on the orb', () => {
    expect(getOrbLean(center, center)).toEqual({ x: 0, y: 0 })
  })
  it('leans in proportion within 260px', () => {
    expect(getOrbLean({ x: 870, y: 930 }, center)).toEqual({ x: -0.5, y: 0.5 })
  })
  it('caps the lean at 1', () => {
    expect(getOrbLean({ x: 1300, y: 800 }, center)).toEqual({ x: 1, y: 0 })
  })
  it('ignores pointers more than 400px away', () => {
    expect(getOrbLean({ x: 0, y: 0 }, center)).toEqual({ x: 0, y: 0 })
  })
})

describe('createChatOrbScene', () => {
  it('returns null when WebGL is unavailable', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(createChatOrbScene(document.createElement('canvas'))).toBeNull()
    vi.restoreAllMocks()
  })
})
```

Return a literal `{ x: 0, y: 0 }` beyond reach, because `toEqual` treats `-0` and `0` as different.

- [ ] **Step 2: Write the failing lifecycle tests** (`chatOrbScene.lifecycle.test.ts`)

```ts
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
  expect(orb.scene.children.filter((c) => (c as Light).isLight)).toHaveLength(2)
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
  /* same spies as the sphere's dispose test */
})
```

- [ ] **Step 3: Run the tests and check they fail**

Run: `npx vitest run src/components/three/chatOrbScene`
Expected: FAIL, because `chatOrbScene` doesn't exist yet.

- [ ] **Step 4: Implement `chatOrbScene.ts`**

Mirror `sphereScene.ts`, using the values above. In `tick`:
- Set rotation, position and scale from `elapsedMs` directly rather than adding to them each frame, so the result is deterministic.
- The position is `(lean.x * 1.6, -lean.y * 1.6, 0)`.

- [ ] **Step 5: Run the tests and check they pass**

Run: `npx vitest run src/components/three/`
Expected: PASS

- [ ] **Step 6: Checkpoint.** Suggested commit: `feat: add the chat orb scene`

---

### Task 3: Orb component (`ChatOrb.tsx`)

**Files:**
- Create: `portfolio/src/components/three/ChatOrb.tsx` (default export, for `React.lazy`)
- Test: `portfolio/src/components/three/ChatOrb.test.tsx`. Mock `./chatOrbScene` the way `DisplacementSphere.test.tsx` mocks `./sphereScene`, keeping `getOrbLean` real.

**Interfaces:**
- Consumes: `createChatOrbScene`, `getOrbLean` and `ChatOrbScene` from Task 2.
- Produces:
  - `export interface ChatOrbProps { theme: Theme; paused: boolean; onReady: () => void }`
  - `export default function ChatOrb(props: ChatOrbProps)`
  - It renders `<canvas aria-hidden="true" className="absolute inset-0 size-full" />`, or `null` when the scene can't be created.

**Behaviour:**
- **Create:** create the scene once; dispose it on unmount.
- **Theme:** call `setTheme(theme)` before the first `render()`. After that first render, call `onReady()` exactly once.
- **Size:** call `resize(canvas.clientWidth || 72, window.devicePixelRatio || 1)` on mount and on window `resize`.
- **Animation:**
  - Run a `requestAnimationFrame` loop that calls `tick(now - start, lean)` then `render()`. It runs only while `!paused`, motion isn't reduced and `!document.hidden`; listen for `visibilitychange`.
  - `lean` comes from two framer-motion `useSpring(0, { stiffness: 30, damping: 20, mass: 2 })` values, which reuse the hero's rotation spring.
  - They are fed by a window `pointermove` listener: `getOrbLean(pointer, center of canvas.getBoundingClientRect())`. The listener is attached only while the loop runs.
- **Still frame:** under reduced motion, or while paused, draw one still frame and no loop.

- [ ] **Step 1: Write the failing tests** (use the `settle()` helper and the fake scene pattern from `DisplacementSphere.test.tsx`)

```ts
it('renders nothing and never reports ready without WebGL', async () => {
  vi.mocked(createChatOrbScene).mockReturnValue(null)
  const onReady = vi.fn()
  const { container } = render(<ChatOrb theme="dark" paused={false} onReady={onReady} />)
  await waitFor(() => expect(container.querySelector('canvas')).toBeNull())
  expect(onReady).not.toHaveBeenCalled()
})

it('lights the orb before its first frame, then reports ready once', () => {
  const onReady = vi.fn()
  render(<ChatOrb theme="dark" paused={false} onReady={onReady} />)
  expect(vi.mocked(fake.setTheme).mock.invocationCallOrder[0])
    .toBeLessThan(vi.mocked(fake.render).mock.invocationCallOrder[0])
  expect(onReady).toHaveBeenCalledTimes(1)
})

it('sizes the drawing buffer to the canvas', () => {
  render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
  expect(fake.resize).toHaveBeenCalledWith(72, 1)
})

it('animates while the chat is closed', async () => {
  render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
  await waitFor(() => expect(fake.tick).toHaveBeenCalled())
})

it('stops animating while the chat is open', async () => {
  render(<ChatOrb theme="dark" paused onReady={vi.fn()} />)
  await settle()
  expect(fake.tick).not.toHaveBeenCalled()
})

it('draws one still frame under reduced motion', async () => {
  reducedMotion.value = true
  render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
  await settle()
  expect(fake.render).toHaveBeenCalled()
  expect(fake.tick).not.toHaveBeenCalled()
})

it('pauses while the tab is hidden', async () => {
  render(<ChatOrb theme="dark" paused={false} onReady={vi.fn()} />)
  await waitFor(() => expect(fake.tick).toHaveBeenCalled())
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => true })
  act(() => { document.dispatchEvent(new Event('visibilitychange')) })
  const ticks = vi.mocked(fake.tick).mock.calls.length
  await settle()
  expect(vi.mocked(fake.tick).mock.calls.length).toBe(ticks)
})
// afterEach: delete (document as { hidden?: boolean }).hidden

it('swaps lights on theme change without rebuilding', () => {
  /* rerender with theme="light": createChatOrbScene called once, setTheme last called with 'light' */
})

it('disposes the scene on unmount', () => {
  /* unmount, then expect fake.dispose to have been called */
})
```

- [ ] **Step 2: Run the tests and check they fail**

Run: `npx vitest run src/components/three/ChatOrb.test.tsx`
Expected: FAIL, because the module doesn't exist.

- [ ] **Step 3: Implement `ChatOrb.tsx`.** Follow the effect order in `DisplacementSphere.tsx`: create the scene, then the theme effect (which calls `onReady` through a ref so it runs once), then resize, then the loop, then pointer and visibility.

- [ ] **Step 4: Run the tests and check they pass**

Run: `npx vitest run src/components/three/`
Expected: PASS

- [ ] **Step 5: Checkpoint.** Suggested commit: `feat: add the lazy-loadable chat orb component`

---

### Task 4: Chat state and API (`chatApi.ts`, `useChat.ts`)

**Files:**
- Create: `portfolio/src/components/chat/chatApi.ts`
- Create: `portfolio/src/components/chat/useChat.ts`
- Test: `portfolio/src/components/chat/chatApi.test.ts`
- Test: `portfolio/src/components/chat/useChat.test.ts`

**Interfaces:**
- Produces, in `chatApi.ts`:
  ```ts
  export type ChatRole = 'user' | 'assistant'
  export interface ChatMessage {
    readonly id: string
    readonly role: ChatRole
    readonly content: string
    readonly decode: boolean
  }
  export interface HistoryItem { readonly role: 'user' | 'model'; readonly content: string }
  export const WELCOME_ID = 'welcome'
  export const WELCOME_MESSAGE: ChatMessage // { id: WELCOME_ID, role: 'assistant', content: <welcome copy>, decode: false }
  export const NETWORK_ERROR = 'Network error. Please try again.'
  export function toHistory(messages: readonly ChatMessage[]): HistoryItem[]
  export function requestReply(
    message: string,
    history: readonly HistoryItem[],
    fetchImpl?: typeof fetch,
  ): Promise<string>
  ```
- Produces, in `useChat.ts`:
  ```ts
  export const SUGGESTIONS: readonly string[] // the three verbatim suggestions, in order
  export type ChatStatus = 'online' | 'input' | 'processing'
  export const STATUS_LABELS: Readonly<Record<ChatStatus, string>> // ONLINE / INPUT / PROCESSING
  export function getChatStatus(waiting: boolean, draft: string): ChatStatus
  export interface ChatController {
    readonly messages: readonly ChatMessage[]
    readonly waiting: boolean
    readonly suggestions: readonly string[]
    readonly draft: string
    setDraft(value: string): void
    submitDraft(): void
    askSuggestion(text: string): void
    markDecoded(id: string): void
  }
  export function useChat(fetchImpl?: typeof fetch): ChatController
  ```

**Behaviour:**
- `requestReply` never throws.
  - On `success === true` with a string `reply`, it returns the reply.
  - Otherwise it returns `Error: ${typeof error === 'string' ? error : 'Unknown error'}`.
  - On any thrown error (fetch or JSON), it returns `NETWORK_ERROR`.
  - The default `fetchImpl` must be `(input, init) => fetch(input, init)`. A bare `fetch` reference throws "Illegal invocation" in Chrome.
- Sending:
  - Trim the text. Ignore it if it's empty, or if a request is already in flight.
  - Add the user message with `decode: false`.
  - Compute history from the messages *before* that user message.
  - Set `waiting`, then add the reply with `decode: true`.
- `askSuggestion` removes that suggestion, then sends its text. IDs come from a `useRef` counter (`msg-1`, `msg-2`, …).

- [ ] **Step 1: Write the failing `chatApi` tests**

```ts
const replying = (body: unknown) => vi.fn().mockResolvedValue({ json: () => Promise.resolve(body) })

it('keeps the welcome copy word for word', () => {
  expect(WELCOME_MESSAGE.content).toBe(
    "Hi! I'm Gens' AI assistant. Ask me anything about his experience, skills, or projects — I'm here to help!",
  )
})

it('drops the welcome message and maps roles for the API', () => {
  expect(toHistory([
    WELCOME_MESSAGE,
    { id: 'u1', role: 'user', content: 'Hi', decode: false },
    { id: 'a1', role: 'assistant', content: 'Hello', decode: false },
  ])).toEqual([{ role: 'user', content: 'Hi' }, { role: 'model', content: 'Hello' }])
})

it('posts the message and history as JSON to /api/chat', async () => {
  const fetchImpl = replying({ success: true, reply: 'Hello' })
  await requestReply('Hi', [{ role: 'user', content: 'Earlier' }], fetchImpl)
  expect(fetchImpl).toHaveBeenCalledWith('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hi', messages: [{ role: 'user', content: 'Earlier' }] }),
  })
})

it('returns the reply on success', async () => {
  expect(await requestReply('Hi', [], replying({ success: true, reply: 'Hello' }))).toBe('Hello')
})

it('shows the API error', async () => {
  expect(await requestReply('Hi', [], replying({ success: false, error: 'Rate limited' }))).toBe('Error: Rate limited')
})

it.each([{ success: false }, { success: true }, null, 'oops'])('falls back to Unknown error for %j', async (body) => {
  expect(await requestReply('Hi', [], replying(body))).toBe('Error: Unknown error')
})

it('shows the network error when fetch rejects', async () => {
  expect(await requestReply('Hi', [], vi.fn().mockRejectedValue(new TypeError('offline')))).toBe(NETWORK_ERROR)
})

it('shows the network error when the body is not JSON', async () => {
  const fetchImpl = vi.fn().mockResolvedValue({ json: () => Promise.reject(new SyntaxError('bad')) })
  expect(await requestReply('Hi', [], fetchImpl)).toBe(NETWORK_ERROR)
})
```

- [ ] **Step 2: Write the failing `useChat` tests** (`renderHook` and `act` from `@testing-library/react`)

```ts
it('opens with the welcome message and the three suggestions', () => {
  const { result } = renderHook(() => useChat(vi.fn()))
  expect(result.current.messages).toEqual([WELCOME_MESSAGE])
  expect(result.current.suggestions).toEqual(['What does Gens build?', 'AI experience?', 'Open to work?'])
})

it.each([
  [false, '', 'online'],
  [false, '   ', 'online'],
  [false, 'hi', 'input'],
  [true, 'hi', 'processing'],
  [true, '', 'processing'],
] as const)('getChatStatus(%s, %j) is %s', (waiting, draft, status) => {
  expect(getChatStatus(waiting, draft)).toBe(status)
})

it('sends the trimmed draft, waits, then adds the reply to decode', async () => {
  let resolve!: (body: unknown) => void
  const fetchImpl = vi.fn(() => new Promise((r) => { resolve = (body) => r({ json: async () => body }) }))
  const { result } = renderHook(() => useChat(fetchImpl as unknown as typeof fetch))
  act(() => result.current.setDraft('  What stack?  '))
  act(() => result.current.submitDraft())
  expect(result.current.draft).toBe('')
  expect(result.current.waiting).toBe(true)
  expect(result.current.messages.at(-1)).toMatchObject({ role: 'user', content: 'What stack?', decode: false })
  await act(async () => resolve({ success: true, reply: 'React and Node.' }))
  expect(result.current.waiting).toBe(false)
  expect(result.current.messages.at(-1)).toMatchObject({ role: 'assistant', content: 'React and Node.', decode: true })
})

it('ignores blank drafts and anything sent while waiting', async () => {
  /* setDraft('   ') then submitDraft: fetch not called.
     Then setDraft('a'), submitDraft, setDraft('b'), submitDraft, askSuggestion('AI experience?'):
     fetch called once. */
})

it('sends a suggestion once and removes it', async () => {
  /* askSuggestion('AI experience?'):
     suggestions no longer contain it;
     the last user message content is 'AI experience?';
     the fetch body message is 'AI experience?' */
})

it('sends earlier turns as history, without the welcome', async () => {
  /* Send 'First' (reply 'Reply 1'), then 'Second'.
     The second fetch body's messages equal
     [{ role: 'user', content: 'First' }, { role: 'model', content: 'Reply 1' }] */
})

it('stops decoding a reply once it has been shown', async () => {
  /* After a reply arrives, markDecoded(reply.id) makes that message's decode false */
})
```

- [ ] **Step 3: Run the tests and check they fail**

Run: `npx vitest run src/components/chat/`
Expected: FAIL, because the modules don't exist.

- [ ] **Step 4: Implement `chatApi.ts` and `useChat.ts`.** Treat the parsed JSON as `unknown` and narrow it.

- [ ] **Step 5: Run the tests and check they pass**

Run: `npx vitest run src/components/chat/`
Expected: PASS

- [ ] **Step 6: Checkpoint.** Suggested commit: `feat: add chat state and API client for the new chatbot`

---

### Task 5: Replies that decode in (`decode.ts`, `rehypeDecodeOffsets.ts`, `DecodedMarkdown.tsx`)

**Files:**
- Create: `portfolio/src/components/chat/decode.ts`
- Create: `portfolio/src/components/chat/rehypeDecodeOffsets.ts`
- Create: `portfolio/src/components/chat/DecodedMarkdown.tsx`
- Test: `portfolio/src/components/chat/decode.test.ts`
- Test: `portfolio/src/components/chat/rehypeDecodeOffsets.test.ts`
- Test: `portfolio/src/components/chat/DecodedMarkdown.test.tsx`

**Interfaces:**
- Consumes: `GLYPHS` from `../motion/decoder` (its first glyph is `'{'`).
- Produces, in `decode.ts`:
  ```ts
  export const DECODE_FRONTIER = 10
  export function getDecodeDuration(totalChars: number): number // clamp(totalChars * 15, 600, 2000) ms
  export function getRevealedCount(elapsedMs: number, durationMs: number, totalChars: number): number
  // (totalChars + DECODE_FRONTIER) * (1 - (1 - p) ** 1.6), where p = clamp(elapsedMs / durationMs, 0, 1)
  export interface DecodeFrame { readonly settled: string; readonly scrambled: string; readonly hidden: string }
  export function decodeFrame(text: string, revealed: number, random?: () => number): DecodeFrame
  export function countDecodableChars(markdown: string): number
  ```
  - `decodeFrame`: let `s = clamp(floor(revealed), 0, len)` and `e = clamp(floor(revealed) + DECODE_FRONTIER, 0, len)`.
    - `settled = text.slice(0, s)` and `hidden = text.slice(e)`.
    - `scrambled` is `text.slice(s, e)` with whitespace kept and every other character replaced by `GLYPHS[floor(random() * GLYPHS.length)]`.
  - `countDecodableChars`: the length after removing `**`, `__`, backticks, line-start `#` runs (with their space) and line-start list markers (`- `, `* `, `1. `). It's only an estimate for timing; the final copy snaps in at the end anyway.
  - Frontier glyphs re-roll every frame. That deliberately simplifies the spec's suggestion to reuse `shuffle()`'s hold-half-a-step rhythm: the shared part is the glyph set, and at chat text size a per-frame re-roll looks the same.
- Produces, in `rehypeDecodeOffsets.ts`:
  - `export function rehypeDecodeOffsets(): (tree: Root) => void`, with `import type { Root } from 'hast'`.
  - It walks the tree in document order and wraps every text node that has visible characters in `{ type: 'element', tagName: 'span', properties: { dataDecodeOffset: n }, children: [textNode] }`.
  - `n` is the total length of earlier wrapped text nodes. Whitespace-only text nodes stay as they are and don't count.
- Produces, in `DecodedMarkdown.tsx`:
  - `export interface DecodedMarkdownProps { markdown: string; decode: boolean; onDone?: () => void }`
  - `export function DecodedMarkdown(props: DecodedMarkdownProps)`

**Rendering:**
- **Final copy:** `<div data-testid="reply-final" className={animating ? 'sr-only' : undefined}>` holding `<Markdown components={MARKDOWN_COMPONENTS}>`. It stays mounted throughout, so the live log announces it once. `animating` is `decode && !reducedMotion && !done`.
- **Decoding copy:** only while animating, `<div aria-hidden="true" data-testid="reply-decoding">` holding `<Markdown rehypePlugins={[rehypeDecodeOffsets]} components={{ ...MARKDOWN_COMPONENTS, span: DecodeSpan }}>`.
  - Its `span` override reads `Number(props['data-decode-offset'])`. When that's NaN, it renders a plain span.
  - Otherwise it renders `{settled}<span data-decode-glyphs className="text-cyan-400/80 light:text-cyan-600/80">{scrambled}</span><span className="invisible">{hidden}</span>`, from `decodeFrame(text, revealed - offset)`.
  - `revealed` comes from a React context.
- **Clock:** a `requestAnimationFrame` loop measures elapsed time from the timestamps rAF passes in (the first frame is the start) against `getDecodeDuration(countDecodableChars(markdown))`. At the end it sets `done` and calls `onDone` once. Under reduced motion, `onDone` is called on mount.
- **Unmounting:** don't call `onDone` on unmount. StrictMode remounts would cancel the decode in dev.
- **`MARKDOWN_COMPONENTS`:** the current `Chatbot.tsx` overrides for `p`, `ul`, `ol`, `li` and `strong`. `strong` uses `font-semibold text-white light:text-slate-900`. Keep the object module-private.

- [ ] **Step 1: Write the failing `decode` tests**

```ts
it.each([[10, 600], [80, 1200], [500, 2000], [5000, 2000]])('caps the decode at two seconds (%i chars → %i ms)', (chars, ms) => {
  expect(getDecodeDuration(chars)).toBe(ms)
})

it('reveals nothing at the start and everything, frontier included, at the end', () => {
  expect(getRevealedCount(0, 2000, 100)).toBe(0)
  expect(getRevealedCount(2000, 2000, 100)).toBe(110)
  expect(getRevealedCount(9999, 2000, 100)).toBe(110)
})

it('eases out', () => {
  expect(getRevealedCount(1000, 2000, 100)).toBeCloseTo(73.71, 1)
})

it('settles, scrambles a frontier of ten and hides the rest', () => {
  expect(decodeFrame('The quick brown fox', 4, () => 0)).toEqual({
    settled: 'The ',
    scrambled: '{{{{{ {{{{',
    hidden: 'n fox',
  })
})

it('starts a later text node part-way into the frontier', () => {
  expect(decodeFrame('abc def', -8, () => 0)).toEqual({ settled: '', scrambled: '{{', hidden: 'c def' })
})

it('shows a finished text node as is', () => {
  expect(decodeFrame('abc', 12)).toEqual({ settled: 'abc', scrambled: '', hidden: '' })
})

it('scrambles only with the hero glyphs', () => {
  const { scrambled } = decodeFrame('Contreras builds', 0)
  expect([...scrambled].every((c) => c === ' ' || GLYPHS.includes(c))).toBe(true)
})

it.each([['Hi **there**', 8], ['- one\n- two', 7], ['## Title', 5]])('estimates the visible length of %j', (md, n) => {
  expect(countDecodableChars(md)).toBe(n)
})
```

- [ ] **Step 2: Write the failing plugin test**

```ts
it('numbers visible text nodes in reading order and skips whitespace', () => {
  const tree: Root = {
    type: 'root',
    children: [
      {
        type: 'element',
        tagName: 'p',
        properties: {},
        children: [
          { type: 'text', value: 'Hi ' },
          { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: 'there' }] },
        ],
      },
      { type: 'text', value: '\n' },
      { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: 'Bye' }] },
    ],
  }
  rehypeDecodeOffsets()(tree)
  const [p1, gap, p2] = tree.children as [Element, Text, Element]
  expect(p1.children[0]).toMatchObject({
    tagName: 'span',
    properties: { dataDecodeOffset: 0 },
    children: [{ value: 'Hi ' }],
  })
  expect((p1.children[1] as Element).children[0]).toMatchObject({ properties: { dataDecodeOffset: 3 } })
  expect(gap).toEqual({ type: 'text', value: '\n' })
  expect(p2.children[0]).toMatchObject({ properties: { dataDecodeOffset: 8 } })
})
```

- [ ] **Step 3: Write the failing component tests**

```ts
it('renders the reply directly when it is not decoding', () => {
  render(<DecodedMarkdown markdown="**Maneho.ai** ships" decode={false} />)
  expect(screen.getByText('Maneho.ai').tagName).toBe('STRONG')
  expect(screen.queryByTestId('reply-decoding')).toBeNull()
  expect(screen.getByTestId('reply-final')).not.toHaveClass('sr-only')
})

it('keeps the full reply for screen readers while it decodes', () => {
  render(<DecodedMarkdown markdown="Full-stack apps" decode />)
  expect(screen.getByTestId('reply-final')).toHaveClass('sr-only')
  expect(screen.getByTestId('reply-final')).toHaveTextContent('Full-stack apps')
  expect(screen.getByTestId('reply-decoding')).toHaveAttribute('aria-hidden', 'true')
})

it('reserves the final layout while decoding', () => {
  render(<DecodedMarkdown markdown={'- one\n- two\n- three'} decode />)
  expect(screen.getByTestId('reply-decoding').querySelectorAll('li')).toHaveLength(3)
})

it('scrambles with the hero glyphs', async () => {
  render(<DecodedMarkdown markdown="Full-stack apps with an AI edge" decode />)
  await waitFor(() => {
    const glyphs = screen.getByTestId('reply-decoding').querySelector('[data-decode-glyphs]')?.textContent ?? ''
    expect(glyphs.trim().length).toBeGreaterThan(0)
    expect([...glyphs].every((c) => /\s/.test(c) || GLYPHS.includes(c))).toBe(true)
  })
})

it('finishes a long reply within two seconds and reports done once', () => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'setTimeout'] })
  const onDone = vi.fn()
  const long = Array.from({ length: 40 }, (_, i) => `- **Point ${i}**: a fairly long line about the work`).join('\n')
  render(<DecodedMarkdown markdown={long} decode onDone={onDone} />)
  act(() => { vi.advanceTimersByTime(2100) })
  expect(onDone).toHaveBeenCalledTimes(1)
  expect(screen.queryByTestId('reply-decoding')).toBeNull()
  expect(screen.getByTestId('reply-final')).not.toHaveClass('sr-only')
  vi.useRealTimers()
})

it('shows the reply at once under reduced motion', () => {
  reducedMotion.value = true
  const onDone = vi.fn()
  render(<DecodedMarkdown markdown="Hello" decode onDone={onDone} />)
  expect(screen.queryByTestId('reply-decoding')).toBeNull()
  expect(onDone).toHaveBeenCalledTimes(1)
})

it('never renders HTML from a reply', () => {
  const { container } = render(<DecodedMarkdown markdown={'Use <b>bold</b> <script>alert(1)</script>'} decode={false} />)
  expect(container.querySelector('b, script')).toBeNull()
})
```

- [ ] **Step 4: Run the tests and check they fail**

Run: `npx vitest run src/components/chat/decode.test.ts src/components/chat/rehypeDecodeOffsets.test.ts src/components/chat/DecodedMarkdown.test.tsx`
Expected: FAIL, because the modules don't exist.

- [ ] **Step 5: Implement the three files**

- [ ] **Step 6: Run the tests and check they pass**

Run: the same command
Expected: PASS

- [ ] **Step 7: Checkpoint.** Suggested commit: `feat: decode chat replies in with the hero glyphs`

---

### Task 6: Pose and engagement (`terminalPose.ts`, `useEngagement.ts`, `useCanTilt.ts`)

**Files:**
- Create: `portfolio/src/components/chat/terminalPose.ts`
- Create: `portfolio/src/components/chat/useEngagement.ts`
- Create: `portfolio/src/components/chat/useCanTilt.ts`
- Test: one `*.test.ts(x)` file for each

**Interfaces:**
- Produces, in `terminalPose.ts`:
  ```ts
  export type TerminalPose = 'rest' | 'hover' | 'engaged'
  export interface TerminalAngles { readonly rotateY: number; readonly rotateX: number }
  export const CLOSED_ROTATE_Y = -96
  export function getTerminalPose(engaged: boolean, hovered: boolean): TerminalPose // engaged beats hover
  export function getTerminalAngles(pose: TerminalPose, canTilt: boolean): TerminalAngles
  // rest {-24, 2}, hover {-9, 0}, engaged {0, 0}; canTilt false → {0, 0}
  ```
- Produces, in `useEngagement.ts`:
  ```ts
  export interface EngagementHandlers {
    onPointerEnter(): void
    onPointerLeave(): void
    onPointerDown(): void
    onKeyDown(): void
    onFocus(): void
    onBlur(event: FocusEvent<HTMLElement>): void
  }
  export interface Engagement {
    readonly engaged: boolean
    readonly hovered: boolean
    readonly handlers: EngagementHandlers
    focusQuietly(element: HTMLElement | null): void // focus that doesn't count as engaging
  }
  export function useEngagement(): Engagement
  ```
  - `onFocus` sets `engaged` unless a quiet-focus ref is set. `focusQuietly` sets the ref, calls `.focus()` (focus events fire synchronously), then clears it.
  - `onBlur` clears `engaged` when `event.relatedTarget` is outside `event.currentTarget`.
- Produces, in `useCanTilt.ts`:
  - `export const TILT_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 640px)'`
  - `export function useCanTilt(): boolean`. Use `useSyncExternalStore` with `matchMedia`. It returns `false` when `window.matchMedia` isn't a function.

- [ ] **Step 1: Write the failing tests**

```ts
// terminalPose.test.ts
it.each([
  [false, false, 'rest'],
  [false, true, 'hover'],
  [true, false, 'engaged'],
  [true, true, 'engaged'],
] as const)('engaged=%s hovered=%s → %s', (engaged, hovered, pose) => {
  expect(getTerminalPose(engaged, hovered)).toBe(pose)
})

it.each([
  ['rest', { rotateY: -24, rotateX: 2 }],
  ['hover', { rotateY: -9, rotateX: 0 }],
  ['engaged', { rotateY: 0, rotateX: 0 }],
] as const)('tilts the %s pose', (pose, angles) => {
  expect(getTerminalAngles(pose, true)).toEqual(angles)
})

it('faces straight on where tilting is off', () => {
  expect(getTerminalAngles('rest', false)).toEqual({ rotateY: 0, rotateX: 0 })
})
```

```tsx
// useEngagement.test.tsx: a harness of <div {...handlers} data-testid="panel"><input /><button>inside</button></div><button>outside</button>
it('starts disengaged and ignores quiet focus', () => {
  /* After focusQuietly(input): input has focus and engaged is false */
})
it('engages when the visitor types', () => {
  /* fireEvent.keyDown(input, { key: 'a' }) → engaged */
})
it('engages on a press inside', () => {
  /* fireEvent.pointerDown(inside button) → engaged */
})
it('engages when the visitor moves focus in', () => {
  /* act(() => insideButton.focus()) → engaged */
})
it('disengages when focus leaves the panel', () => {
  /* engage, then act(() => outsideButton.focus()) → not engaged */
})
it('tracks hover', () => {
  /* fireEvent.pointerEnter(panel) → hovered; fireEvent.pointerLeave(panel) → not hovered */
})
```

```ts
// useCanTilt.test.ts. Stub with vi.stubGlobal('matchMedia', …); call vi.unstubAllGlobals() in afterEach.
it('stays flat when matchMedia is unavailable', () => {
  expect(renderHook(() => useCanTilt()).result.current).toBe(false)
})
it('tilts on a fine pointer with hover', () => {
  /* stub matches: true for TILT_QUERY → true */
})
it('follows changes to the media query', () => {
  /* fire the stub's change listener with matches: false → false */
})
```

- [ ] **Step 2: Run the tests and check they fail**

Run: `npx vitest run src/components/chat/terminalPose.test.ts src/components/chat/useEngagement.test.tsx src/components/chat/useCanTilt.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement the three files.** @testing-library's `fireEvent.pointerEnter` and `pointerLeave` are mapped to the over and out events that React listens for, so plain `onPointerEnter` and `onPointerLeave` handlers work.

- [ ] **Step 4: Run the tests and check they pass**

Run: the same command
Expected: PASS

- [ ] **Step 5: Checkpoint.** Suggested commit: `feat: add terminal pose and engagement tracking`

---

### Task 7: The terminal (`TerminalMessage.tsx`, `ChatTerminal.tsx`, terminal CSS)

**Files:**
- Create: `portfolio/src/components/chat/TerminalMessage.tsx`
- Create: `portfolio/src/components/chat/ChatTerminal.tsx`
- Modify: `portfolio/src/index.css`. Append a `/* Chat terminal */` block; re-read the file first, because other sessions edit it.
- Test: `portfolio/src/components/chat/ChatTerminal.test.tsx`

**Interfaces:**
- Consumes:
  - `ChatController`, `getChatStatus`, `STATUS_LABELS` and `ChatMessage` (Task 4)
  - `DecodedMarkdown` (Task 5)
  - `getTerminalPose`, `getTerminalAngles`, `CLOSED_ROTATE_Y`, `useEngagement` and `useCanTilt` (Task 6)
- Produces:
  - `export function TerminalMessage({ message, onDecoded }: { message: ChatMessage; onDecoded: (id: string) => void })`
  - `export function ProcessingRow()`
  - `export interface ChatTerminalProps { id: string; chat: ChatController; onClose: () => void }`
  - `export function ChatTerminal(props: ChatTerminalProps)`
  - `export const FOCUS_DELAY_MS = 150`

**ChatTerminal structure:**

The root is a `motion.div`, rendered inside the fixed stage that Task 8 owns:
- Attributes: `id={id}`, `role="dialog"`, `aria-modal="false"`, `aria-label="Ask about Genessis"` and `data-pose={pose}`.
- Classes: `chat-terminal pointer-events-auto absolute inset-0 flex flex-col overflow-hidden rounded-md`.
- Style: `style={{ transformOrigin: '100% 50%' }}`.
- Motion:
  - Normally:
    - `initial` and `exit`: `{ opacity: 0, rotateY: CLOSED_ROTATE_Y }`
    - `animate`: `{ opacity: 1, ...getTerminalAngles(pose, canTilt) }`
    - `transition`: `{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }`
  - Under reduced motion: opacity only, a 0.2s transition and angles `{0, 0}`.
- Handlers: the engagement handlers, plus `Escape` → `onClose()`.

Its children, in order:
1. Four corners: `<i aria-hidden className="chat-corner chat-corner--tl" />`, and likewise `--tr`, `--bl`, `--br`.
2. Scanlines: `<div aria-hidden className="chat-scanlines" />`.
3. Header (`chat-head`):
   - `<p>` with an `aria-hidden` cyan `>`, then `ask_genessis`, then `<span aria-hidden className="chat-caret" />`
   - `<p data-testid="chat-status" data-status={status} className="chat-status ml-auto">{STATUS_LABELS[status]}</p>`
   - `<button type="button" aria-label="Close chat">[×]</button>`
4. Log:
   - `<div role="log" aria-live="polite" aria-label="Conversation">` holding the `TerminalMessage`s, plus `<ProcessingRow />` while waiting.
   - On every change to message count or `waiting`, scroll it to the bottom with `scrollTop = scrollHeight` in a layout effect.
5. Keys: one `<button type="button" className="chat-key" disabled={chat.waiting}>` per suggestion, calling `askSuggestion`.
6. Form (`relative z-10 flex items-center gap-2 border-t border-dashed border-cyan-400/25 px-3.5 pb-4 pt-2.5`; `onSubmit` → `preventDefault` and `submitDraft`). The input is `font-mono-label` at 13px on a transparent background, with a cyan caret:
   - `>` prompt
   - Input: value `chat.draft`, `onChange` → `setDraft`, placeholder `type a question…`, `maxLength={500}`, `aria-label="Message"`
   - `<button type="submit" className="chat-key" aria-label="Send message" disabled={!chat.draft.trim() || chat.waiting}>⏎ Enter</button>`

On mount, call `focusQuietly(input)` after `FOCUS_DELAY_MS`, and clear the timer on unmount.

**TerminalMessage:**
- Assistant: the label `GENS.AI ›` (cyan, mono, `text-[10px] font-medium tracking-[0.18em]`). Under it, a body with a 2px cyan left rule holding `<DecodedMarkdown markdown={content} decode={message.decode} onDone={() => onDecoded(message.id)} />`.
- User: right-aligned. The label `YOU ›` is light indigo, and the text sits in a thin indigo-outlined box (`rounded-sm border border-indigo-400/45 bg-indigo-500/10`).
- `ProcessingRow`: the label `GENS.AI ›`, the visible text `PROCESSING`, and `<span aria-hidden className="chat-blocks">` with 8 `<i />`. It also has `<span className="sr-only">Waiting for a reply</span>`.

**CSS:** port these rules from `chat-combo.html`, renaming them. Use mono weight 500 where the mockup uses 600 or 700.

| Mockup | `index.css` |
|---|---|
| `.c-term` background, border, radius and shadows (not its transform or transition: framer-motion drives the angles) | `.chat-terminal`, with `.light .chat-terminal` from the `[data-theme="light"]` rule |
| `.c-scene` `perspective: 900px; perspective-origin: -20% 50%` | `.chat-stage` (used by Task 8) |
| `.corner`, `.tl`, `.tr`, `.bl` and `.br` | `.chat-corner` and `--tl` / `--tr` / `--bl` / `--br`, plus a light rule |
| `.c-scan`, `::after` and `@keyframes scan` | `.chat-scanlines`, `::after` and `@keyframes chat-scan` |
| `.c-head` gradient | `.chat-head`, plus a light rule |
| `.caret` and `@keyframes blink` | `.chat-caret` and `@keyframes chat-blink` |
| `.c-status` and `[data-state=…]` | `.chat-status[data-status="online" / "input" / "processing"]`, plus light rules |
| `.c-proc .bar i` and `@keyframes fill` with delays | `.chat-blocks > i` and `@keyframes chat-fill` |
| `.key` with its hover, active, disabled and light rules | `.chat-key` |

Finish with `@media (prefers-reduced-motion: reduce) { .chat-caret, .chat-scanlines::after, .chat-blocks > i { animation: none; } }`.

- [ ] **Step 1: Write the failing tests** (`ChatTerminal.test.tsx`)

The fake controller:

```ts
function fakeChat(overrides: Partial<ChatController> = {}): ChatController {
  return {
    messages: [WELCOME_MESSAGE],
    waiting: false,
    suggestions: [...SUGGESTIONS],
    draft: '',
    setDraft: vi.fn(),
    submitDraft: vi.fn(),
    askSuggestion: vi.fn(),
    markDecoded: vi.fn(),
    ...overrides,
  }
}
const renderTerminal = (chat = fakeChat(), onClose = vi.fn()) =>
  render(<><ChatTerminal id="chat-terminal" chat={chat} onClose={onClose} /><button>outside</button></>)
```

The tests:

```ts
it('is a dialog named after the assistant, with the terminal prompt', () => {
  renderTerminal()
  expect(screen.getByRole('dialog', { name: 'Ask about Genessis' })).toBeInTheDocument()
  expect(screen.getByText('ask_genessis')).toBeInTheDocument()
})

it.each([
  [{}, 'ONLINE'],
  [{ draft: 'hi' }, 'INPUT'],
  [{ waiting: true }, 'PROCESSING'],
])('shows %j as %s', (overrides, label) => {
  renderTerminal(fakeChat(overrides))
  expect(screen.getByTestId('chat-status')).toHaveTextContent(label)
})

it('labels who said what in a polite live log', () => {
  renderTerminal(fakeChat({
    messages: [WELCOME_MESSAGE, { id: 'u1', role: 'user', content: 'Hi', decode: false }],
  }))
  const log = screen.getByRole('log')
  expect(log).toHaveAttribute('aria-live', 'polite')
  expect(within(log).getByText('GENS.AI ›')).toBeInTheDocument()
  expect(within(log).getByText('YOU ›')).toBeInTheDocument()
})

it('shows the processing row while waiting', () => {
  renderTerminal(fakeChat({ waiting: true }))
  expect(within(screen.getByRole('log')).getByText('Waiting for a reply')).toBeInTheDocument()
})

it('turns suggestions into keys that lock while waiting', () => {
  const chat = fakeChat()
  const { unmount } = renderTerminal(chat)
  fireEvent.click(screen.getByRole('button', { name: 'AI experience?' }))
  expect(chat.askSuggestion).toHaveBeenCalledWith('AI experience?')
  unmount()
  renderTerminal(fakeChat({ waiting: true }))
  expect(screen.getByRole('button', { name: 'AI experience?' })).toBeDisabled()
})

it('passes typing to the controller and sends only when there is something to send', () => {
  /* draft '' → Send message disabled.
     change on Message → setDraft called with the value.
     draft 'hi' → Send enabled; clicking it calls submitDraft.
     waiting → disabled. */
})

it('closes from [×] and from Escape', () => {
  /* click 'Close chat' → onClose; keyDown Escape on the dialog → onClose again */
})

it('lands at rest with the cursor already in the input', async () => {
  renderTerminal()
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Message' })).toHaveFocus())
  expect(screen.getByRole('dialog')).toHaveAttribute('data-pose', 'rest')
})

it('turns toward the pointer, and faces the visitor once they type', async () => {
  renderTerminal()
  const dialog = screen.getByRole('dialog')
  fireEvent.pointerEnter(dialog)
  expect(dialog).toHaveAttribute('data-pose', 'hover')
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Message' }), { key: 'a' })
  expect(dialog).toHaveAttribute('data-pose', 'engaged')
})

it('returns to rest when focus leaves the terminal', () => {
  /* engage by keyDown, act(() => outside.focus()), fireEvent.pointerLeave(dialog) → data-pose 'rest' */
})
```

- [ ] **Step 2: Run the tests and check they fail**

Run: `npx vitest run src/components/chat/ChatTerminal.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement `TerminalMessage.tsx` and `ChatTerminal.tsx`, then add the CSS block**

- [ ] **Step 4: Run the tests and check they pass, then lint**

Run: `npx vitest run src/components/chat/` then `npm run lint`
Expected: PASS, with no lint errors

- [ ] **Step 5: Checkpoint.** Suggested commit: `feat: add the holo terminal chat panel`

---

### Task 8: Launcher and wiring (`useDocumentTheme.ts`, `ChatLauncher.tsx`, `Chatbot.tsx`)

**Files:**
- Create: `portfolio/src/components/chat/useDocumentTheme.ts`
- Create: `portfolio/src/components/chat/ChatLauncher.tsx`
- Rewrite: `portfolio/src/components/Chatbot.tsx`
- Test: `portfolio/src/components/chat/useDocumentTheme.test.ts`
- Test: `portfolio/src/components/chat/ChatLauncher.test.tsx`
- Test: `portfolio/src/components/Chatbot.test.tsx`

**Interfaces:**
- Consumes: Tasks 3, 4 and 7, and `DecorativeBoundary` from `../DecorativeBoundary`.
- Produces:
  - `export function useDocumentTheme(): Theme`. Use `useSyncExternalStore` with a `MutationObserver` on `document.documentElement`'s `class` attribute; it's `'light'` when `.light` is present.
  - `export interface ChatLauncherProps { open: boolean; controlsId: string; theme: Theme; onToggle: () => void; ref?: Ref<HTMLButtonElement> }` and `export function ChatLauncher(props: ChatLauncherProps)`
  - `export const CHAT_TERMINAL_ID = 'chat-terminal'` and `export function Chatbot()`. It takes no props; `App.tsx` stays as is.

**ChatLauncher:**

```tsx
<button
  type="button"
  aria-label={open ? 'Close chat' : 'Open chat'}
  aria-expanded={open}
  aria-controls={controlsId}
  data-open={open}
  className="group fixed bottom-4 right-4 z-50 grid size-16 place-items-center rounded-full sm:bottom-5 sm:right-6 sm:size-18"
>
```

It contains:
1. `<span aria-hidden className="chat-halo …" />`. It's hidden when `group-data-[open=true]`, using the mockup's `.orb-launch::before` and `@keyframes halo`, renamed `chat-halo`.
2. The orb layer: `<span aria-hidden data-testid="chat-orb" className="relative size-full transition duration-500 group-hover:scale-108 group-data-[open=true]:scale-30 group-data-[open=true]:opacity-0 motion-reduce:transition-none">`. It holds:
   - `<span data-testid="chat-orb-fallback" className="chat-orb-fallback absolute inset-3.5 rounded-full" />`, until `onReady`
   - `<DecorativeBoundary><Suspense fallback={null}><ChatOrb theme={theme} paused={open} onReady={…} /></Suspense></DecorativeBoundary>`, with `const ChatOrb = lazy(() => import('../three/ChatOrb'))`
3. The close mark: `<span aria-hidden data-testid="chat-orb-close">` holding an × icon in a cyan-ringed dark glass circle (white glass in the light theme, `inset-3`). It's hidden (opacity 0, scale 0.4, rotated -90°) until `group-data-[open=true]`.

Add `.chat-halo`, `@keyframes chat-halo` and `.chat-orb-fallback` to the Task 7 CSS block, and add `.chat-halo` to its reduced-motion rule.

**Chatbot:**
- State: `open`, `useChat()` and `useDocumentTheme()`, plus `launcherRef`.
- `close()` sets `open` to false and focuses the launcher. It is used for `[×]` and Escape.
- It renders:
  - `<div data-testid="chat-stage" className="chat-stage pointer-events-none fixed bottom-24 right-4 z-50 h-[min(476px,calc(100dvh-13rem))] w-[calc(100vw-2rem)] sm:bottom-27 sm:right-6 sm:w-87.5">` holding `<AnimatePresence>{open && <ChatTerminal key="terminal" id={CHAT_TERMINAL_ID} chat={chat} onClose={close} />}</AnimatePresence>`
  - `<ChatLauncher ref={launcherRef} open={open} controlsId={CHAT_TERMINAL_ID} theme={theme} onToggle={() => setOpen((o) => !o)} />`

- [ ] **Step 1: Write the failing tests**

```ts
// useDocumentTheme.test.ts (afterEach: document.documentElement.classList.remove('light'))
it('reads dark by default', () => {
  expect(renderHook(() => useDocumentTheme()).result.current).toBe('dark')
})
it('follows the light class on <html>', async () => {
  const { result } = renderHook(() => useDocumentTheme())
  act(() => document.documentElement.classList.add('light'))
  await waitFor(() => expect(result.current).toBe('light'))
})
```

For `ChatLauncher.test.tsx`, copy `settle()` from `DisplacementSphere.test.tsx`, and use `const { orbMode } = vi.hoisted(() => ({ orbMode: { value: 'ready' as 'ready' | 'throw' } }))`. Mock `../three/ChatOrb` with a default export that throws when `orbMode.value === 'throw'`; otherwise it calls `onReady` in an effect and renders `<canvas />`.

```ts
it('is a labelled toggle for the terminal', () => {
  /* closed: name 'Open chat', aria-expanded 'false', aria-controls 'chat-terminal'.
     rerender open: 'Close chat', 'true', data-open 'true' */
})
it('shows the CSS orb until the 3D orb is ready', async () => {
  /* render closed → waitFor queryByTestId('chat-orb-fallback') to be null */
})
it('keeps the CSS orb and still opens the chat when the 3D orb fails', async () => {
  orbMode.value = 'throw'
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const onToggle = vi.fn()
  render(<ChatLauncher open={false} controlsId="chat-terminal" theme="dark" onToggle={onToggle} />)
  await settle()
  expect(screen.getByTestId('chat-orb-fallback')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
  expect(onToggle).toHaveBeenCalled()
})
```

For `Chatbot.test.tsx`:
- Set `reducedMotion.value = true` in `beforeEach`, so replies render without decoding.
- Stub `fetch` with `vi.stubGlobal('fetch', vi.fn())`, and call `vi.unstubAllGlobals()` in `afterEach`.

```ts
it('starts closed, and the orb opens the terminal', async () => {
  render(<Chatbot />)
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Open chat' }))
  expect(await screen.findByRole('dialog', { name: 'Ask about Genessis' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Close chat', expanded: true })).toBeInTheDocument()
})

it('sends a question and shows the reply', async () => {
  vi.mocked(fetch).mockResolvedValue({ json: async () => ({ success: true, reply: 'Mostly **React**.' }) } as Response)
  /* open; change Message to 'What stack?'; click 'Send message';
     findByText('React') has tagName STRONG;
     the fetch body includes message 'What stack?' */
})

it('keeps the conversation after closing and reopening', async () => {
  /* send and get a reply; click the orb ('Close chat'); click 'Open chat'; the reply is still in the log */
})

it.each(['Escape', '[×]'])('returns focus to the orb when closed with %s', async (how) => {
  /* open; close with keyDown Escape on the dialog, or click the 'Close chat' button inside the dialog;
     waitFor the dialog to be gone; the orb button has focus */
})

it('keeps a reply that arrives while the chat is closed', async () => {
  /* fetch returns a pending promise; send 'Hi'; close; resolve { success: true, reply: 'Late reply' };
     reopen; findByText('Late reply'); fetch called once */
})

it('shows the network error when the request fails', async () => {
  /* fetch rejects; send; findByText('Network error. Please try again.') */
})

it('caps the terminal height to the screen', () => {
  render(<Chatbot />)
  expect(screen.getByTestId('chat-stage')).toHaveClass('h-[min(476px,calc(100dvh-13rem))]')
})
```

- [ ] **Step 2: Run the tests and check they fail**

Run: `npx vitest run src/components/chat/useDocumentTheme.test.ts src/components/chat/ChatLauncher.test.tsx src/components/Chatbot.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement the three files.** `Chatbot.tsx` no longer imports `react-markdown`; `DecodedMarkdown` does.

- [ ] **Step 4: Run the whole suite and lint**

Run: `npm test` then `npm run lint`
Expected: all tests PASS, with no lint errors

- [ ] **Step 5: Checkpoint.** Suggested commit: `feat: replace the chat widget with the orb and holo terminal`

---

### Task 9: Coverage, docs, notices and a check in a real browser

**Files:**
- Modify: `portfolio/vitest.config.ts`
- Modify: `portfolio/THIRD_PARTY_NOTICES.md`
- Modify: `docs/DESIGN.md`

The controller messages `portfolio-42` first. Re-read each file right before editing, because that session appends to all three.

- [ ] **Step 1: Coverage.** Add `'src/components/chat/**'` and `'src/components/Chatbot.tsx'` to `coverage.include`. `src/components/three/**` is already listed.

Run: `npm run coverage`
Expected: thresholds pass (80% lines, functions, branches and statements).

- [ ] **Step 2: Notices.** In the "Adapted in" sentence of Hamish's section, extend the `src/components/three/` entry to mention the chat orb, for example "(displacement sphere and chat orb)".

- [ ] **Step 3: Design doc.** Add `### Chatbot (orb + holo terminal)` under Component Patterns in `docs/DESIGN.md`. In 10–15 lines, cover:
- the orb (hero shader at 0.55 displacement, 64/72px, lazy-loaded with a CSS fallback, becomes × while open)
- the terminal (350×476, poses rest -24°/2° → hover -9° → engaged 0°, the hinge swing, flat on touch and under reduced motion)
- decode (hero glyphs, a 10-character frontier, ≤2s, final layout reserved)
- keycaps, the status labels, and the focus and Escape rules

- [ ] **Step 4: Full check**

Run: `npm run lint && npm test && npm run build`
Expected: all three succeed.

- [ ] **Step 5: Real-browser screenshots.** jsdom can't check 3D CSS or WebGL. Follow the `headless-webgl-screenshots` memory: headless Edge on the real GPU over CDP, against both `npm run dev` (StrictMode) and `npm run build && npm run preview`. Capture:

| Viewport | Theme | What to check |
|---|---|---|
| 1440×900 | dark and light | Chat closed: the orb is in the bottom-right corner. |
| 1440×900 | dark and light | Chat open: the terminal lands tilted and the orb is replaced by ×. |
| 1440×900 | dark and light | Typing: after a key press in the input, the terminal faces straight on. |
| 390×844 | either | Open: the terminal is flat and above the orb. |
| 360×640 | either | Open: the terminal fits between the top bar and the orb. |

No errors should appear in the console. Text in the terminal must read clearly in both themes (WCAG AA). Check the dim labels and placeholder especially, and darken any token that falls short.

- [ ] **Step 6: Optional, if Genessis wants it.** Check the live AI on a Vercel preview (see the `vercel-preview-testing` memory). `/api/chat` doesn't run under `npm run dev`.

- [ ] **Step 7: Checkpoint.** Suggested commit: `docs: record the chatbot pattern and cover the chat in tests`

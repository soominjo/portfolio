# Projects Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the tabbed project card grid with a pinned scroll showcase. Each scroll step brings in the next of 11 projects as an Alerta-style text panel beside a 3D laptop (plus a phone for most projects) built in three.js.

**Architecture:** `ProjectShowcase` renders a tall track holding a sticky, full-viewport stage. One invisible step sentinel per project drives the active index through an IntersectionObserver midline, the same technique `useActiveSection` uses. Every project's text panel stays in the DOM, with only the active one visible. The 3D stage (`DeviceStage`, a lazy chunk) owns a framework-free `deviceScene` that builds the laptop and phone from rounded extrusions, cross-fades screenshot textures, tweens the finish colour, and runs a Hamish-style intro and cursor lean. It renders only while something moves.

**Tech Stack:** React 19, TypeScript 6, Tailwind 4, framer-motion 12, three 0.187, Vitest 5 with Testing Library on jsdom 31.

**Spec:** the Decisions section below. It records the 2026-11-10 brainstorming conversation: the user approved the mockup at `.superpowers/brainstorm/3671-1794301485/content/projects-scroll.html`, then said "just build it first".

## Decisions (the spec)

1. Each project shows, top to bottom: an index line (`01 / 11`), a meta line (`Professional · Full-Stack Developer`), a big title, a one-line tagline, the tech stack and a "View more →" button. Engineering projects show logo tiles (at most 6, then "+N more"); QA projects show text chips (at most 4, then "+N more"). The devices sit to the right from `lg` up and above the text below `lg`.
2. The stage pins. Each 75svh of scrolling brings in the next project; the last step is 100svh, after which the page continues to Contact.
3. Order: engineering `flinki`, `commission-monitoring-system`, `unwnd-cafe`, `leads-management-system`, `maneho-ai`, `flux-fitness-tracker`; then QA `cadpractice`, `switchboard`, `tms`, `mythica`, `reviva`.
4. Every project shows a laptop. Every project except `commission-monitoring-system` and `leads-management-system` also shows a phone. When the phone goes away, the laptop slides to the centre.
5. Finishes rotate silver → black → white in showcase order, stored per project so the user can change them. The laptop and phone share the project's finish, and finish changes tween.
6. The laptop shows the desktop screenshot, cover-cropped to 16:10 and centred. The phone shows the mobile screenshot. Only Flinki has one so far (the user will send the rest); the others show a generated placeholder with the project's initial on the site gradient.
7. A segmented progress bar, grouped Engineering / QA Engineering, sits at the bottom of the stage; clicking a segment jumps to that project. The old tabs and card grid go away.
8. Palette and fonts come from `docs/DESIGN.md`: indigo/cyan on `#05070f`, and `#f7f9fc` for the light theme. Concentric rings and a glow sit behind the devices.
9. The devices are built in code (no .glb files), so there are no model licences to clear. The intro (lid swings open, phone springs up) and the cursor lean follow Hamish's approach and are credited in the notices.
10. "View more" opens a dialog with the full description, the full tech list and the screenshots. Demo links were removed on purpose in 47899ef, so don't add any.
11. Taglines are drafts written from each `purpose`; the user may edit them.

## Global Constraints

- three.js is imported only under `portfolio/src/components/three/`. `DeviceStage` is loaded with `React.lazy` inside `<DecorativeBoundary><Suspense fallback={null}>`.
- No new npm dependencies of our own. Brand icons come from the `simple-icons` package (CC0-1.0), which the skills session (portfolio-17) is adding to `package.json`. Don't install it yourself; wait for their "done" message before Task 2, and work on Tasks 3 and 5–8 in the meantime.
- Four other sessions are editing this tree. Touch only:
  - `sections/Projects.tsx`, plus deleting `sections/ProjectCard.tsx`
  - `shared/types/project.ts` and `shared/data/projects.ts`
  - the new folders `portfolio/src/components/projects/`, `portfolio/src/components/three/devices/` and `portfolio/public/projects/`
  - in Task 10 only, appends to `vitest.config.ts`, `THIRD_PARTY_NOTICES.md` and `docs/DESIGN.md`, re-reading each right before editing.
- Never run `npm install`. No commits: the user commits, and the tree is shared.
- App data is immutable: helpers return new arrays and objects and never mutate props or `shared/` data. three.js scene objects are mutable by design and exempt.
- Under reduced motion there is no intro, no cursor lean, and slide and finish changes are instant. Pinning stays.
- Keep files at 400 lines or fewer and functions under 50 lines. Give exports explicit types, and use `import type` for type-only imports (`verbatimModuleSyntax`).
- `DeviceStage.tsx` and `deviceScene.ts` start with `// Adapted from https://github.com/HamishMW/portfolio (MIT, Copyright (c) 2020 Hamish Williams). See THIRD_PARTY_NOTICES.md.`
- Keep `clear-side-nav` on the section content, so it clears the floating side nav on `desk` screens. Keep `pt-16 desk:pt-0` on the stage, because the phone top bar is 64px tall.
- Run commands from `portfolio/`. Run one test file with `npx vitest run <path>`.

## Review Focus

1. Fast scrolling can make textures resolve out of order. The screen must end on the newest slide, never a stale one (Task 7: `ignores a texture that resolves after a newer slide`).
2. When a screenshot fails to load (404 or decode error), that screen shows the placeholder and nothing rejects unhandled (Task 7: `falls back to the placeholder when a screenshot fails`).
3. When the window is resized across `lg` while pinned, the canvas resizes and the camera reframes (Task 8: `resizes the scene on window resize`).
4. A keyboard-only user who tabs to a hidden project's button activates that project (Task 9: `scrolls a project into view when its button gets focus`).
5. Without WebGL, a static screenshot fallback appears and the text still works (Task 8: `renders the fallback when WebGL is unavailable`).

---

## File map

| File | Responsibility |
|---|---|
| `shared/types/project.ts` | `DeviceFinish` plus the new project fields |
| `shared/data/projects.ts` | order, taglines, finishes, phones, screenshot paths |
| `portfolio/public/projects/*.webp` | 1440px-wide desktop screenshots, `flinki-mobile.webp` |
| `src/components/projects/showcaseOrder.ts` | showcase order and category groups |
| `src/components/projects/techIcons.ts` | Simple Icons subset, name lookup, dark-logo test, initials |
| `src/components/projects/TechStack.tsx` | logo tiles or chips with "+N more" |
| `src/components/projects/useActiveStep.ts` | IntersectionObserver midline → active index |
| `src/components/projects/ProjectPanel.tsx` | one project's text block |
| `src/components/projects/ProgressRail.tsx` | grouped segments, jump on click |
| `src/components/projects/ProjectDetailsDialog.tsx` | native `<dialog>` with full details |
| `src/components/projects/deviceSlides.ts` | `Project` → `DeviceSlide` |
| `src/components/projects/StageBackground.tsx` | rings and glow, both themes |
| `src/components/projects/ScreenshotFallback.tsx` | no-WebGL fallback |
| `src/components/projects/ProjectShowcase.tsx` | track, sticky stage, wiring |
| `src/components/sections/Projects.tsx` | section header plus showcase |
| `src/components/three/devices/deviceTypes.ts` | `DeviceSlide` (no three import) |
| `src/components/three/devices/finishes.ts` | finish specs |
| `src/components/three/devices/screenFit.ts` | cover-crop UV transform |
| `src/components/three/devices/motionMath.ts` | spring step, easing, lerp |
| `src/components/three/devices/framing.ts` | camera distance for an aspect |
| `src/components/three/devices/roundedRect.ts` | rounded shapes, slabs, planes |
| `src/components/three/devices/deviceMaterials.ts` | shared materials, finish blending |
| `src/components/three/devices/screenLayers.ts` | two-layer cross-fading screen |
| `src/components/three/devices/shadowTexture.ts` | radial contact-shadow texture |
| `src/components/three/devices/laptopModel.ts` | laptop geometry and lid pivot |
| `src/components/three/devices/phoneModel.ts` | phone geometry |
| `src/components/three/devices/textureCache.ts` | LRU texture cache |
| `src/components/three/devices/placeholderTexture.ts` | initial-on-gradient phone placeholder |
| `src/components/three/devices/deviceScene.ts` | renderer, lights, rig, animation state |
| `src/components/three/devices/DeviceStage.tsx` | React wrapper (lazy default export) |

(`src/` paths are under `portfolio/`.)

---

### Task 1: Project data, showcase order, optimised screenshots

**Files:**
- Modify: `shared/types/project.ts`, `shared/data/projects.ts`
- Create: `portfolio/src/components/projects/showcaseOrder.ts`, `portfolio/public/projects/{flinki,commission-monitoring-system,unwnd-cafe,leads-management-system,maneho-ai,flux-fitness-tracker,cadpractice,switchboard,tms,mythica,reviva}.webp`, `portfolio/public/projects/flinki-mobile.webp`
- Test: `portfolio/src/components/projects/projectData.test.ts`

**Interfaces:**
- Produces:
  - `type DeviceFinish = 'silver' | 'black' | 'white'`
  - `Project` gains `tagline: string`, `mobileImageUrl?: string`, `showPhone: boolean` and `deviceFinish: DeviceFinish`. `imageUrl` stays and now points at `/projects/<id>.webp`.
  - `CATEGORY_LABELS: Readonly<Record<ProjectCategory, string>>`, with `engineering` → `'Engineering'` and `qa` → `'QA Engineering'`.
  - `interface ShowcaseGroup { readonly category: ProjectCategory; readonly label: string; readonly start: number; readonly end: number }` (`end` is exclusive).
  - `orderForShowcase(projects: readonly Project[]): Project[]`: engineering first, then QA, each sorted by `order`, as a new array.
  - `groupShowcase(ordered: readonly Project[]): ShowcaseGroup[]`

- [ ] **Step 1: Write the failing test**

```ts
const SHOWCASE_IDS = ['flinki', 'commission-monitoring-system', 'unwnd-cafe', 'leads-management-system', 'maneho-ai',
  'flux-fitness-tracker', 'cadpractice', 'switchboard', 'tms', 'mythica', 'reviva']
it('orders engineering projects, then QA, in the agreed sequence') // orderForShowcase(featuredProjects) ids toEqual SHOWCASE_IDS
it('leaves the array it is given untouched')       // reversed copy is still reversed afterwards
it('groups the ordered projects by category')      // toEqual [{engineering,'Engineering',0,6},{qa,'QA Engineering',6,11}]
it('gives every project a one-line tagline')       // 20 <= length <= 90, no newline
it('shows a phone for every project except CMS and Leads') // ids with !showPhone, sorted, toEqual both ids
it('rotates silver, black and white finishes in showcase order')
  // toEqual ['silver','black','white','silver','black','white','silver','black','white','silver','black']
it('has a mobile screenshot for Flinki only')      // flinki → '/projects/flinki-mobile.webp'; others undefined
it('points every screenshot at a file in public/') // existsSync(fileURLToPath(new URL(`../../../public${url}`, import.meta.url)))
```

- [ ] **Step 2: Run** `npx vitest run src/components/projects/projectData.test.ts`. Expected: FAIL, because `./showcaseOrder` can't be resolved.
- [ ] **Step 3: Generate the WebP files** with a throwaway Python/PIL script kept in the scratchpad, not the repo. Desktop source is `public/<old png>`: resize to 1440px wide (LANCZOS), `quality=82, method=6`, saved as `public/projects/<id>.webp`. Mobile source is the user's 351×752 PNG, saved as `flinki-mobile.webp` at `quality=90`. Map the old names: `cms.png`→`commission-monitoring-system`, `unwnd.cafe.png`→`unwnd-cafe`, `leads.png`→`leads-management-system`, `maneho.ai.png`→`maneho-ai`, `flux.png`→`flux-fitness-tracker`; the rest keep their names.
- [ ] **Step 4: Update the type and data.** Use these `order` values: engineering flinki 1, cms 2, unwnd 3, leads 4, maneho 5, flux 6; QA cadpractice 1, switchboard 2, tms 3, mythica 4, reviva 5. Reorder the array to match. Taglines, exactly:
  - flinki: `An AI-powered identity engine for sport and adventure.`
  - commission-monitoring-system: `Tranches, commissions and receivables, automated for a 128-user realty team.`
  - unwnd-cafe: `A calm café storefront with its own in-house POS.`
  - leads-management-system: `A realty team's leads, pipeline and listings in one place.`
  - maneho-ai: `An AI assistant that reads your traffic citation and explains the law.`
  - flux-fitness-tracker: `Log workouts, track progress and see your health data.`
  - cadpractice: `QA for a gamified CAD training platform for STEM educators.`
  - switchboard: `QA for an AI project manager's chat, sprint health and blocker detection.`
  - tms: `QA for an HR platform's access roles, skills workflows and payroll.`
  - mythica: `QA for a mythology magazine across browsers, phones and screen readers.`
  - reviva: `End-to-end QA for a recovery and wellness platform.`
- [ ] **Step 5: Implement `showcaseOrder.ts`.**
- [ ] **Step 6: Run** the test (expected: PASS), then `npm run build` (expected: success, since the API and Resume only read existing fields).

### Task 2: Tech icons and `TechStack`

**Files:**
- Create: `portfolio/src/components/projects/techIcons.ts`, `portfolio/src/components/projects/TechStack.tsx`
- Test: `portfolio/src/components/projects/techIcons.test.ts`, `portfolio/src/components/projects/TechStack.test.tsx`

**Interfaces:**
- Produces:
  - `interface TechIcon { readonly title: string; readonly hex: string; readonly path: string }`. `hex` is six upper-case characters with no `#`.
  - `getTechIcon(name: string): TechIcon | null`
  - `isDarkHex(hex: string): boolean`: relative luminance (linearised sRGB) below 0.15.
  - `techInitials(name: string): string`: the first letters of the words for multi-word names, otherwise the first two letters.
  - `MAX_ICONS = 6`, `MAX_CHIPS = 4`
  - `TechStack({ items, variant }: { readonly items: readonly string[]; readonly variant: 'icons' | 'chips' }): JSX.Element`
- Name → Simple Icons export: Flutter→`siFlutter`; Dart→`siDart`; React→`siReact`; Node.js→`siNodedotjs`; TypeScript→`siTypescript`; Cloud SQL, Google Vertex AI and Cloud Vision OCR→`siGooglecloud`; Genkit and Firebase→`siFirebase`; Mapbox→`siMapbox`; Python→`siPython`; Django→`siDjango`; SQLite→`siSqlite`; Tailwind CSS→`siTailwindcss`; Next.js→`siNextdotjs`; Framer Motion→`siFramer`; Sanity→`siSanity`; PHP→`siPhp`; Laravel→`siLaravel`; HTML→`siHtml5`; Gemini LLMs→`siGooglegemini`. Use named imports so the bundle tree-shakes. If an export doesn't exist in the installed version, drop it and let that name fall back to initials. `title` is the item name as given.
- Markup: `<ul aria-label="Tech stack">`. Each tile is a `role="img"` element labelled with the item name and carrying `title`, holding an `aria-hidden` 24×24 viewBox SVG or the initials. A brand colour that `isDarkHex` flags renders `fill-slate-200 light:fill-[var(--brand)]`; any other renders `fill-[var(--brand)]`, with `--brand` set inline. Chips use the DESIGN.md tech-badge classes. Overflow is one `<li>` holding an `aria-hidden` `+N more` and an `sr-only` `Also: a, b, c`.

- [ ] **Step 1: Write the failing tests**

```ts
it('finds icons by name, including aliases')   // React → hex '61DAFB'; Genkit and Firebase share a path; Cloud SQL → Google Cloud's path
it('returns null for tech without a logo')     // getTechIcon('Zustand') === null
it('spots logos too dark for a dark tile')     // isDarkHex('000000') true, '092E20' true, '61DAFB' false
it('makes initials from names')                // TryTerra→'Tr', 'POS System'→'PS', Zustand→'Zu'
it('shows six logo tiles and counts the rest') // Flinki's 9 items: 6 imgs named Flutter…Cloud SQL, '+3 more', 'Also: Genkit, TryTerra, Mapbox'
it('labels a logo-less tile with its initials') // ['Zustand'] → img named 'Zustand' with text 'Zu'
it('shows QA practices as chips')               // 4 items → 4 listitems, no img role, no '+'
it('caps chips at four')                        // 6 items → 4 chips, '+2 more'
```

- [ ] **Step 2: Run** both files. Expected: FAIL (modules missing).
- [ ] **Step 3: Implement `techIcons.ts`** once `simple-icons` is in `node_modules`, checking with `node -e "require.resolve('simple-icons')"` from `portfolio/`. Add a header comment crediting Simple Icons (CC0-1.0).
- [ ] **Step 4: Implement `TechStack.tsx`.**
- [ ] **Step 5: Run** both files. Expected: PASS.

### Task 3: `useActiveStep`

**Files:**
- Create: `portfolio/src/components/projects/useActiveStep.ts`
- Test: `portfolio/src/components/projects/useActiveStep.test.tsx`

**Interfaces:**
- Produces:
  - `STEP_MIDLINE = '-50% 0px -50% 0px'`
  - `nextActiveStep(previous: number, crossing: ReadonlySet<number>): number`: the largest crossing index, or `previous` when the set is empty.
  - `useActiveStep(stepIds: readonly string[]): number`: starts at 0, observes `document.getElementById(id)` for each id, and disconnects on unmount or when the ids change.

- [ ] **Step 1: Write the failing tests.** The harness renders `<div id>` elements for `['step-a','step-b','step-c']`, then prints the hook value.

```ts
it('picks the latest crossing step')        // nextActiveStep(0, new Set([1, 3])) === 3
it('keeps the previous step when none cross') // nextActiveStep(2, new Set()) === 2
it('starts on the first step')              // nothing intersecting → 0
it('follows the step crossing the middle of the viewport') // intersection.byId = { 'step-c': true } → 2
it('prefers the later step when two cross') // byId b and c → 2
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement it**, using the `useActiveSection` pattern with a `Set<number>` of crossing indices.
- [ ] **Step 4: Run.** Expected: PASS.

### Task 4: `ProjectPanel`, `ProgressRail`, `ProjectDetailsDialog`

**Files:**
- Create: `portfolio/src/components/projects/ProjectPanel.tsx`, `ProgressRail.tsx`, `ProjectDetailsDialog.tsx`
- Test: `ProjectPanel.test.tsx`, `ProgressRail.test.tsx`, `ProjectDetailsDialog.test.tsx` (same folder)

**Interfaces:**
- Consumes: `TechStack`, `ShowcaseGroup`, `Project`.
- Produces:
  - `TYPE_LABELS: Readonly<Record<ProjectType, string>>`: `Professional` / `Personal`.
  - `titleSizeClass(title: string): string`:
    - 12 characters or fewer: `'text-5xl sm:text-6xl xl:text-7xl'`
    - 13 to 18: `'text-4xl sm:text-5xl xl:text-6xl'`
    - longer: `'text-3xl sm:text-4xl xl:text-5xl'`
  - `ProjectPanel(props: { project; index; total; active; onOpenDetails: (p: Project) => void; onFocusInactive: (index: number) => void })`
    - Renders an `<article aria-labelledby data-active>`: the index `01` plus a faint `/ 11`, the meta `${TYPE_LABELS[type]} · ${role}`, an `<h3>` title, the tagline, `TechStack` (icons for engineering, chips for QA) and a "View more" button with `aria-label="View more about ${title}"` and an `aria-hidden` arrow.
    - A capture-phase focus while inactive calls `onFocusInactive(index)`.
    - Inactive panels get `opacity-0 translate-y-3 pointer-events-none`; the active one gets `opacity-100 translate-y-0`. Both have `transition-[opacity,transform] duration-300 motion-reduce:transition-none`.
  - `ProgressRail(props: { groups: readonly ShowcaseGroup[]; titles: readonly string[]; active: number; onJump: (i: number) => void; className?: string })`
    - The root is `aria-hidden="true"`. Each segment is a `<button type="button" tabIndex={-1} title={titles[i]} data-state="past|current|upcoming">`. The group label sits under its row, highlighted while it holds the active index.
  - `ProjectDetailsDialog(props: { project: Project | null; onClose: () => void })`
    - A native `<dialog>`. An effect calls `showModal()` when it gets a project while closed, and `close()` when the project goes back to null. Its `close` event calls `onClose`, and so does a click on the backdrop (`event.target === dialog`).
    - Content: the meta line, an `<h2>` title, `purpose`, every tech item as a badge, `<img alt="${title} on desktop">`, `<img alt="${title} on mobile">` (only when there is a mobile screenshot) and an autofocused "Close" button.
- Tests define `HTMLDialogElement.prototype.showModal` and `close` when jsdom lacks them. `close` sets `open = false` and dispatches `close`.

- [ ] **Step 1: Write the failing tests**

```ts
// ProjectPanel
it('shows the index, meta line, title and tagline') // '01', '/ 11', 'Professional · Full-Stack Developer', h3 'Flinki'
it('uses logo tiles for engineering and chips for QA')
it('marks whether it is the active panel')          // data-active "true" / "false"
it('asks to activate when an inactive panel gets focus') // focus button → onFocusInactive(3); active panel → not called
it('opens details from View more')                  // click → onOpenDetails(project)
it('sizes titles by length')                        // 'Flinki', 'Talent Management', 'Commission Monitoring System'
// ProgressRail
it('renders one segment per project under its group label') // 11 buttons (hidden: true), labels both groups
it('marks past, current and upcoming segments')     // active 7 → [6] past, [7] current, [8] upcoming
it('jumps when a segment is clicked')               // click title 'Mythica' → onJump(9)
it('stays out of the tab order and the accessibility tree') // aria-hidden root, tabIndex -1
// ProjectDetailsDialog
it('stays closed without a project')
it('opens with the full description and every tech item')
it('shows the mobile screenshot only when there is one')
it('reports closing from the Close button and from Escape') // click Close; fire 'close' after cancel
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement the three components.**
- [ ] **Step 4: Run.** Expected: PASS.

### Task 5: Device math (pure, no WebGL)

**Files:**
- Create: `three/devices/deviceTypes.ts`, `finishes.ts`, `screenFit.ts`, `motionMath.ts`, `framing.ts`; `projects/deviceSlides.ts`
- Test: `three/devices/{finishes,screenFit,motionMath,framing}.test.ts`, `projects/deviceSlides.test.ts`

**Interfaces:**
- Produces:
  - `interface DeviceSlide { readonly id: string; readonly label: string; readonly desktopUrl: string | null; readonly mobileUrl: string | null; readonly showPhone: boolean; readonly finish: DeviceFinish }`
  - `toDeviceSlide(project: Project): DeviceSlide`
  - `interface FinishSpec { readonly body: string; readonly metalness: number; readonly roughness: number; readonly keys: string }`
  - `FINISHES`: starting values, tuned in Task 10:

    | Finish | body | metalness | roughness | keys |
    |---|---|---|---|---|
    | silver | `#c7cad0` | 0.85 | 0.32 | `#24262b` |
    | black | `#232529` | 0.55 | 0.42 | `#111214` |
    | white | `#eef0f3` | 0.08 | 0.38 | `#e4e6ea` |

  - `interface UvTransform { readonly repeatX; readonly repeatY; readonly offsetX; readonly offsetY }`
  - `coverTransform(imageAspect: number, screenAspect: number): UvTransform`. Let r = image/screen:
    - r > 1: `repeatX = 1/r`, `offsetX = (1 - 1/r)/2`, Y is identity.
    - r < 1: `repeatY = r`, `offsetY = 1 - r` (anchored to the top), X is identity.
    - A value that isn't finite or is ≤ 0 returns the identity.
  - `interface SpringConfig { stiffness; damping; mass }` and `interface SpringState { value; velocity }`, all readonly numbers.
  - `stepSpring(state, target, config, dtSeconds): SpringState`: semi-implicit Euler in substeps of at most 1/120 s, with `dtSeconds` clamped to [0, 0.1].
  - `isSettled(state, target, epsilon = 1e-3): boolean`, `easeInOutCubic(t): number` (t clamped to 0..1), `lerp(a, b, t): number`
  - `interface Framing { readonly cameraZ: number; readonly cameraY: number; readonly targetY: number }`
  - `frameDevices(aspect: number, fovDegrees: number): Framing`
    - The composition box is 4.6 × 2.7. `cameraZ = 1.08 × max((2.7/2)/tan(fov/2), (4.6/2)/(tan(fov/2) × aspect))`.
    - `targetY = 1`, `cameraY = targetY + cameraZ × 0.22`.

- [ ] **Step 1: Write the failing tests**

```ts
it('keeps an image that already fits')               // coverTransform(1.6, 1.6) → {1,1,0,0}
it('crops the sides of a wider image evenly')        // (2, 1.6) → repeatX 0.8, offsetX 0.1, repeatY 1, offsetY 0
it('crops the bottom of a taller image')             // (0.4, 0.5) → repeatY 0.8, offsetY 0.2, repeatX 1
it('ignores invalid aspects')                        // (0, 1.6) and (NaN, 1) → identity
it('settles a spring on its target')                 // 300 steps of 1/60 → |value - 1| < 1e-3, isSettled true
it('stays stable on a long frame')                   // one 5 s step → finite, |value| <= 2
it('eases in and out')                               // easeInOutCubic(0)=0, (0.5)=0.5, (1)=1, (2)=1
it('moves the camera back for narrower canvases')    // frameDevices(0.8,30).cameraZ > frameDevices(1.8,30).cameraZ, both finite
it('defines every finish with valid colours and ranges') // /^#[0-9a-f]{6}$/i, 0..1
it('maps a project to its device slide')             // flinki: '/projects/flinki.webp', '/projects/flinki-mobile.webp', true, 'silver'
it('drops the phone screenshot when there is none')  // CMS → mobileUrl null, showPhone false
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement the five modules.** None of them import three.
- [ ] **Step 4: Run.** Expected: PASS.

### Task 6: Device models

**Files:**
- Create: `three/devices/roundedRect.ts`, `deviceMaterials.ts`, `screenLayers.ts`, `shadowTexture.ts`, `laptopModel.ts`, `phoneModel.ts`, `textureCache.ts`
- Test: `three/devices/{roundedRect,deviceMaterials,screenLayers,shadowTexture,models,textureCache}.test.ts`

**Interfaces:**
- Consumes: `FinishSpec`, `lerp`.
- Produces:
  - `roundedRectShape(w, h, r): Shape`, centred on the origin.
  - `createRoundedSlab(w, h, r, depth): ExtrudeGeometry`: centred in x and y, spanning z from −depth to 0, bevel 0.012 included in the depth.
  - `createRoundedPlane(w, h, r): ShapeGeometry`: centred, with UVs normalised to 0..1.
  - `interface DeviceMaterials { readonly body: MeshPhysicalMaterial; readonly keys: MeshStandardMaterial; readonly glass: MeshPhysicalMaterial; readonly trim: MeshStandardMaterial }`
  - `createDeviceMaterials(finish: FinishSpec): DeviceMaterials`: glass is `#050507` with roughness 0.08 and clearcoat 1; trim is `#0b0c0f`.
  - `applyFinish(materials, from: FinishSpec, to: FinishSpec, t: number): void`
  - `interface ScreenLayers { readonly group: Group; show(texture: Texture): void; setFade(t: number): void; commit(): void; displayed(): readonly Texture[]; dispose(): void }`
  - `createScreenLayers(geometry: BufferGeometry, name: string): ScreenLayers`
    - It makes two `MeshBasicMaterial` meshes (`toneMapped: false`, transparent) named `${name}-base` and `${name}-top`, with the top 0.0008 in front.
    - A first `show` goes straight onto the base. Later ones go onto the top at opacity 0.
  - `createShadowTexture(size = 64): DataTexture`: black, with alpha `(1 − r)²` from the centre.
  - `LAPTOP = { width: 3, depth: 2.05, baseThickness: 0.075, lidHeight: 2, lidThickness: 0.05, screenWidth: 2.72, screenHeight: 1.7 } as const`, `LID_CLOSED = Math.PI / 2`, `LID_OPEN = -0.2`
  - `interface LaptopModel { readonly group: Group; readonly lid: Group; readonly screen: ScreenLayers; readonly screenAspect: number; dispose(): void }`
  - `createLaptop(m: DeviceMaterials): LaptopModel`
    - Group `laptop`: the base slab lies flat with its bottom at y = 0. Keys are an `InstancedMesh` (6 rows × 14) of `m.keys` in a well behind the trackpad, and the trackpad is a rounded plane.
    - Lid pivot group `laptop-lid` at (0, baseThickness, −depth/2), holding the lid slab, the glass, and screen layers named `laptop-screen`, with the screen facing +z. It starts at `LID_CLOSED`.
  - `PHONE = { width: 0.74, height: 1.52, depth: 0.075, screenWidth: 0.68, screenHeight: 1.46 } as const`
  - `interface PhoneModel { readonly group: Group; readonly screen: ScreenLayers; readonly screenAspect: number; dispose(): void }`
  - `createPhone(m: DeviceMaterials): PhoneModel`: group `phone`, standing with its bottom at y = 0: body slab, glass, screen layers `phone-screen`, an island capsule of 0.2 × 0.055, and side buttons.
  - `type TextureLoadFn = (url: string) => Promise<Texture>`
  - `interface TextureCache { get(url: string): Promise<Texture>; prefetch(urls: readonly string[]): void; pin(textures: readonly Texture[]): void; dispose(): void }`
  - `createTextureCache(load: TextureLoadFn, maxEntries: number): TextureCache`
    - LRU by URL; `get` refreshes recency.
    - Past `maxEntries`, it evicts the least recent entry that isn't pinned and disposes its texture once resolved.
    - A rejected load is dropped, so the next `get` retries.

- [ ] **Step 1: Write the failing tests**

```ts
it('normalises plane UVs to the unit square')      // min (0,0), max (1,1); bbox 2×1 centred
it('fits a slab inside its depth')                 // bbox z within [-depth, 0] ± 1e-6
it('blends finishes')                              // t=0 from body colour, t=1 to, t=0.5 between; metalness lerps
it('puts the first texture straight on the base')  // displayed() = [a]; base opacity 1
it('fades a new texture in over the old one')      // show(b) → top opacity 0; setFade(0.4) → 0.4
it('commits the faded texture to the base')        // commit() → displayed() = [b]; top map null, opacity 0
it('draws a soft round shadow')                    // centre alpha > 200, corner alpha 0
it('hinges the lid at the back of the base')       // lid position (0, 0.075, -1.025)
it('closes the lid flat and opens it upright')     // CLOSED: lid world bbox max.y < 0.15; OPEN: > 1.9
it('stands the phone on the ground')               // bbox min.y ≈ 0 (±0.01), height ≈ 1.52 (±0.03)
it('reports each screen shape')                    // laptop 1.6; phone ≈ 0.466 (±0.002)
it('loads each url once')                          // two gets → load called once
it('evicts and disposes the least recent texture') // max 2, get a b c → a.dispose called
it('never evicts a pinned texture')                // pin([a]) then get b c d → a kept
it('retries a failed load')                        // reject once → second get calls load again
it('disposes everything it holds')
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement the seven modules.** Each model's `dispose()` disposes its own geometries; materials belong to the caller.
- [ ] **Step 4: Run.** Expected: PASS.

### Task 7: `deviceScene`

**Files:**
- Create: `three/devices/deviceScene.ts`, `three/devices/placeholderTexture.ts`
- Test: `three/devices/deviceScene.test.ts`. Fake the `WebGLRenderer` as `sphereScene.lifecycle.test.ts` does, and inject `loadTexture` and `createPlaceholder`.

**Interfaces:**
- Consumes: everything from Tasks 5 and 6.
- Produces:
  - `createPlaceholderTexture(label: string): Texture`: a 2D canvas (512×1100) with a `#05070f`→`#0b1022` gradient, faint indigo grid, the label's initial in Syne bold and the label underneath. Without a 2D context it returns a 1×1 `DataTexture` in `#0b1022`.
  - `interface DeviceSceneOptions { readonly loadTexture?: TextureLoadFn; readonly createPlaceholder?: (label: string) => Texture; readonly onChange?: () => void }`
  - `interface DeviceScene { readonly scene: Scene; resize(w: number, h: number): void; setSlide(s: DeviceSlide, o: { readonly immediate: boolean }): void; prefetch(s: readonly DeviceSlide[]): void; playIntro(o: { readonly immediate: boolean }): void; setPointer(x: number, y: number): void; update(nowMs: number): boolean; render(): void; dispose(): void }`
  - `createDeviceScene(canvas: HTMLCanvasElement, options?: DeviceSceneOptions): DeviceScene | null`
- Values:
  - Renderer: `alpha`, `antialias`, `failIfMajorPerformanceCaveat`. Returns null when it throws. Pixel ratio `min(devicePixelRatio, 2)`, `SRGBColorSpace`, `NeutralToneMapping`.
  - Environment: `RoomEnvironment` through `PMREMGenerator`, skipped if that throws.
  - Lights: hemisphere `#dfe6ff`/`#0b0d16` at 0.6; key `#ffffff` at 2.2 from (3, 5, 4); rim `#818cf8` at 1.6 from (−4, 2.5, −3).
  - Camera: FOV 30, from `frameDevices`.
  - Layout: group `rig` with base rotation y −0.32. Laptop x is −0.45 with a phone and 0 without. Phone at (1.95, 0, 0.6), rotation y −0.25.
  - Shadows: shadow planes under each device, with the phone's shadow opacity following its presence.
  - Springs:
    - lid: `{80, 20, 1}`, after 200 ms
    - phone presence: `{60, 20, 1}`, after 450 ms. Presence p sets y = `lerp(−0.9, 0, p)` and scale `lerp(0.85, 1, p)`, with `visible = p > 0.01`.
    - laptop shift: `{120, 24, 1}`
    - tilt: `{40, 20, 1.4}`, toward rotation y `x × 0.35` and rotation x `y × 0.2`
  - Timing: screen fade 350 ms; finish blend 450 ms with `easeInOutCubic`. Texture cache max 6; displayed textures are pinned.
  - A slide token makes late textures from an older slide get ignored. A failed or missing screenshot shows the placeholder. `onChange` fires when an async texture starts a fade.
  - `update` returns true while any spring is unsettled or any tween is running.

- [ ] **Step 1: Write the failing tests**

```ts
it('returns null when WebGL is unavailable')
it('sizes the renderer and camera on resize')            // setSize(800, 500); camera.aspect 1.6
it('shows the laptop screenshot once it loads')          // resolve → map on 'laptop-screen-base' (immediate); onChange called
it('ignores a texture that resolves after a newer slide') // slide A pending, slide B resolves, then A resolves → B shown
it('falls back to the placeholder when a screenshot fails') // reject → placeholder on screen, no unhandled rejection
it('hides the phone and centres the laptop when the slide has no phone') // after 2 s of updates: phone invisible, laptop x ≈ 0
it('shows the placeholder on the phone without a mobile screenshot')
it('opens the lid on intro and settles')                 // 3 s of 16 ms updates → lid.rotation.x ≈ LID_OPEN; last update false
it('jumps to the end state when immediate')              // one update → lid open, phone presence 1
it('tweens to the new finish')                           // silver → black; after 500 ms body colour = black body
it('leans toward the pointer')                           // setPointer(0.5, 0) → rig rotation.y > -0.32 after 1 s
it('disposes the renderer, geometry and textures')       // renderer.dispose, loaded texture.dispose
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement the two modules.** Keep `deviceScene.ts` under 400 lines; move helpers into the Task 6 modules if needed.
- [ ] **Step 4: Run.** Expected: PASS.

### Task 8: `DeviceStage`

**Files:**
- Create: `three/devices/DeviceStage.tsx`
- Test: `three/devices/DeviceStage.test.tsx`. Mock `./deviceScene` the way `DisplacementSphere.test.tsx` mocks `./sphereScene`.

**Interfaces:**
- Consumes: `createDeviceScene`, `DeviceSlide`.
- Produces: `export default function DeviceStage(props: { readonly slides: readonly DeviceSlide[]; readonly activeIndex: number; readonly fallback: ReactNode; readonly className?: string }): JSX.Element`
- Behaviour:
  - Create the scene once, with `onChange` restarting the render loop. If it's null, render `fallback`.
  - Resize from the container's `clientWidth`/`clientHeight` on mount and on window `resize`.
  - On every `activeIndex`, call `setSlide(slides[i], { immediate: reduceMotion || first })`, then prefetch `[i + 1, i − 1]`.
  - On the first time in view (`useInView`, amount 0.3), call `playIntro({ immediate: reduceMotion })`.
  - On window `pointermove`, but only while in view and motion is allowed, call `setPointer(x / innerWidth − 0.5, y / innerHeight − 0.5)`.
  - The render loop runs `requestAnimationFrame` while `update(now)` returns true, renders one frame otherwise, and stops when out of view.
  - Dispose on unmount. The root is `aria-hidden="true"`.

- [ ] **Step 1: Write the failing tests**

```ts
it('renders the fallback when WebGL is unavailable')
it('creates the scene once and disposes it on unmount')
it('shows the first slide at once, then animates later ones') // immediate true, then false; prefetch neighbours
it('swaps slides at once under reduced motion')
it('plays the intro once the stage is in view')               // intersection.isIntersecting true → once; false → never
it('resizes the scene on window resize')
it('leans toward the pointer only in view with motion allowed')
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement it.**
- [ ] **Step 4: Run.** Expected: PASS.

### Task 9: `ProjectShowcase` and the Projects section

**Files:**
- Create: `projects/ProjectShowcase.tsx`, `projects/StageBackground.tsx`, `projects/ScreenshotFallback.tsx`
- Modify (rewrite): `sections/Projects.tsx`. Delete: `sections/ProjectCard.tsx`.
- Test: `projects/ProjectShowcase.test.tsx`, `sections/Projects.test.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1–5, plus `DeviceStage` through `lazy(() => import('../three/devices/DeviceStage'))`.
- Produces:
  - `STEP_PREFIX = 'project-step-'`
  - `ProjectShowcase({ projects }: { readonly projects: readonly Project[] }): JSX.Element`
  - `ScreenshotFallback({ slide }: { readonly slide: DeviceSlide }): JSX.Element`: the desktop screenshot in a rounded, bordered frame with `alt="${label} on desktop"`.
  - `StageBackground(): JSX.Element`: `aria-hidden`. It draws the rings and glow centred at (50%, 30%) below `lg` and (70%, 50%) from `lg`, as two layers: dark-only, and `light:` with lower alpha.
- Layout classes:

  | Part | Classes |
  |---|---|
  | track | `relative` |
  | stage | `sticky top-0 h-svh overflow-hidden` |
  | grid | `clear-side-nav relative mx-auto flex h-full max-w-[88rem] flex-col px-6 pb-20 pt-16 desk:pt-0 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-8 lg:pb-0` |
  | devices cell | `relative order-1 h-[40%] shrink-0 lg:order-2 lg:h-[78%]` |
  | panels cell | `relative order-2 min-h-0 flex-1 lg:order-1 lg:h-[70%]` holding `<ol aria-label="Projects">` with one `<li class="absolute inset-0 flex items-start lg:items-center">` per panel |
  | rail | `absolute bottom-6 left-6 desk:left-32 lg:bottom-10` |
  | sentinels | an `aria-hidden` wrapper `-mt-[100svh]`; each sentinel `h-[75svh]`, the last `h-svh` |

- Jump: `document.getElementById(STEP_PREFIX + id)?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' })`.
- Section header copy is unchanged: `// my.work`, `Featured Projects`, `Projects spanning full-stack engineering and quality assurance — two sides of how I ship reliable software.` It sits in `clear-side-nav px-6 pt-28 pb-6`, then `mx-auto max-w-6xl`. The section keeps `id="projects"`, `relative` and `bg-[#05070f] light:bg-[#f7f9fc]`.

- [ ] **Step 1: Write the failing tests.** Mock `../three/devices/DeviceStage` with a stub that records its props, and stub `Element.prototype.scrollIntoView`.

```ts
it('renders every project as an article, in showcase order')
it('shows the project whose step crosses the middle of the viewport') // byId['project-step-mythica'] → Mythica active only
it('scrolls to a project from the progress bar')        // click title 'Talent Management System' → scrollIntoView on #project-step-tms
it('scrolls a project into view when its button gets focus') // focus 'View more about Reviva' → #project-step-reviva
it('opens the details dialog from View more')           // purpose text visible
it('hands the device stage one slide per project')      // 11 slides; CMS and Leads showPhone false; activeIndex 0
// sections/Projects.test.tsx
it('keeps the projects anchor and header')              // section#projects, heading 'Featured Projects'
```

- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement the three components, rewrite `Projects.tsx`, delete `ProjectCard.tsx`.** Afterwards, `grep -r ProjectCard portfolio/src` should return nothing.
- [ ] **Step 4: Run** both files (expected: PASS), then `npm test` (expected: all pass).

### Task 10: Visual tuning, notices, docs, verification

**Files:**
- Tune (no API changes): `finishes.ts`, `deviceScene.ts` constants, panel and stage classes
- Append: `portfolio/vitest.config.ts` (coverage include), `portfolio/THIRD_PARTY_NOTICES.md`, `docs/DESIGN.md`

- [ ] **Step 1: Check the visuals.** Start `npm run dev -- --port 5180 --strictPort` in the background. Take CDP screenshots:
  - desktop 1440×900 at projects 1, 2, 3, 7 and 11
  - phone 390×844 at projects 1 and 2
  - the light theme (`localStorage.theme = 'light'`)
  - reduced motion (`Emulation.setEmulatedMedia`)

  Tune finishes, lights, framing and type until the devices read well in all three finishes and nothing overlaps. Re-run `npm test`.
- [ ] **Step 2: Coverage.** Re-read `vitest.config.ts`, then add `'src/components/projects/**'` and `'src/components/sections/Projects.tsx'` to `coverage.include`. Run `npm run coverage`. Expected: thresholds pass.
- [ ] **Step 3: Notices.** Re-read `THIRD_PARTY_NOTICES.md`. Add `src/components/three/devices/` (device intro and cursor lean) to Hamish's "Adapted in" sentence. Add a "Simple Icons" section: CC0-1.0, https://github.com/simple-icons/simple-icons, brand logos remain trademarks of their owners.
- [ ] **Step 4: Design doc.** Re-read `docs/DESIGN.md` and add a "Projects Showcase" pattern covering the pinned scroll, panel anatomy, finishes, devices and reduced motion.
- [ ] **Step 5: Verify.** Run `npm run lint`, `npm test` and `npm run build`. Expected: no errors from these files, all tests pass, build succeeds. Then message portfolio-ff that the build passes.
- [ ] **Step 6: Review.** Get a fresh code review of the changed files and fix Critical and High findings.

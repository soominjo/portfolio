# DESIGN.md — Genessis Contreras Portfolio

## Brand Personality

Dark, technical, cyberpunk-adjacent. The aesthetic is precision-engineered: deep space backgrounds, glowing accent colors, monospace labels paired against bold display type. Grid lines suggest systems architecture. Glow effects suggest active computation. Every detail signals a builder who cares about craft.

---

## Color Palette

### Dark Theme (default)

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#05070f` | Page background |
| `bg-surface` | `rgba(255,255,255,0.025)` | Card glass fill |
| `bg-overlay` | `#05070f` at 85–95% opacity | Navbar, mobile menu |
| `text-primary` | `#e2e8f0` (slate-200) | Body text |
| `text-muted` | `#94a3b8` (slate-400) | Secondary text, descriptions |
| `text-faint` | `#64748b` (slate-500) | Labels, placeholders |
| `accent-indigo` | `#6366f1` (indigo-500) | Primary CTA, glow source, grid lines |
| `accent-indigo-light` | `#818cf8` (indigo-400) | Display name glow |
| `accent-cyan` | `#22d3ee` (cyan-400) | Hover states, card borders, links |
| `accent-green` | `#4ade80` (green-400) | Available status, pulse dot |
| `border-default` | `rgba(99,102,241,0.18)` | Card glass borders |
| `border-hover` | `rgba(34,211,238,0.45)` | Card hover border |
| `border-nav` | `rgba(99,102,241,0.20)` | Navbar bottom border |

### Light Theme

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#f8fafc` (slate-50) | Page background |
| `text-primary` | `#0f172a` (slate-900) | Body text |

---

## Typography

### Font Stack

| Role | Font | Class |
|---|---|---|
| Display / Headings / Brand | **Syne** | `.font-display` |
| Body / UI | **DM Sans** | default `body` |
| Labels / Tags / Mono UI | **JetBrains Mono** | `.font-mono-label` |

### Scale

| Use | Tailwind | Notes |
|---|---|---|
| Hero heading | `text-6xl → text-8xl` | `font-display font-bold leading-none tracking-tight` |
| Section heading | `text-3xl–text-4xl` | `font-display font-bold` |
| Card title | `text-lg` | `font-display font-bold text-white` |
| Body | `text-base → text-lg` | `leading-relaxed text-slate-400` |
| Label / tag | `text-xs` | `font-mono-label tracking-widest uppercase` |
| Tech badge | `text-[10px]` | `font-mono-label` |
| Small body | `text-sm` | `leading-relaxed` |

---

## Effects & Utilities

### Grid Background
```css
.grid-bg {
  background-image:
    linear-gradient(rgba(99,102,241,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,102,241,0.07) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

### Glow Text
```css
.glow-text   { text-shadow: 0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.25); }
.glow-cyan   { text-shadow: 0 0 20px rgba(34,211,238,0.6), 0 0 40px rgba(34,211,238,0.3); }
```

### Card Glass
```css
.card-glass {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(99,102,241,0.18);
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
}
.card-glass:hover {
  border-color: rgba(34,211,238,0.45);
  box-shadow: 0 0 30px rgba(34,211,238,0.07), 0 8px 32px rgba(0,0,0,0.3);
  transform: translateY(-3px);
}
```

### Button Glow
```css
.btn-glow {
  box-shadow: 0 0 20px rgba(99,102,241,0.35), 0 4px 15px rgba(99,102,241,0.25);
  transition: box-shadow 0.2s, background-color 0.2s, transform 0.15s;
}
.btn-glow:hover {
  box-shadow: 0 0 30px rgba(99,102,241,0.55), 0 4px 25px rgba(99,102,241,0.4);
  transform: translateY(-1px);
}
```

### Input Focus Glow
```css
.input-glow:focus {
  outline: none;
  border-color: rgba(99,102,241,0.7);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.15), 0 0 20px rgba(99,102,241,0.1);
}
```

---

## Component Patterns

### Navbar (floating side nav)
Spacing is copied from Hamish Williams' portfolio (MIT).
- **Desktop (`desk`, meaning at least 48rem wide and 43rem tall):** a fixed 48px column (`w-12`), inset by the outer margin on top, left and bottom: 48px, or 64px above 1680px wide. It has no background and no border, so it floats over the page. The side nav needs about 43rem of height, so shorter screens get the phone menu, as on hamishw.com.
  - **Logo:** `GC.` in `font-display text-2xl font-bold`, padded 8px with 24px below (`p-2 pb-6`).
  - **Links:** directly under the logo, set vertically and reading bottom to top (`[writing-mode:vertical-lr] rotate-180`). They use DM Sans at 16px medium in normal case (`text-base font-medium`), with 16px padding each, in `text-slate-300/80` that turns white on hover or when current.
  - **Active bar:** a 4px cyan bar (`light:bg-cyan-600` for contrast on the light page) runs through the hovered, keyboard-focused or current link, inset 8px from both ends. It uses physical `top-2 bottom-2`, because Tailwind's `inset-y` is logical and runs sideways in vertical text, and it is centred with `left-1/2 -translate-x-1/2`.
  - **Current link:** follows the section crossing the middle of the viewport (`useActiveSection`, `aria-current="location"`), not the last click. Nothing is marked while the hero is in view.
  - **Bottom:** GitHub, LinkedIn and Resume, in 48px boxes with 8px padding and 20px icons.
- **Theme toggle:** fixed in the top-right corner, inset by the outer margin minus 6px (42px, or 58px above 1680px wide), in a 56px box. Its 38px icon morphs from a sun (light) to a moon (dark); see `.theme-icon__*` in `index.css`. It sits on a soft see-through disc (`bg-[#05070f]/55`, `light:bg-white/65`, `backdrop-blur-md`) so it stays readable when it floats over page content while scrolling.
- **Section clearance:** sections and the footer carry `.clear-side-nav` (8rem left padding under the same condition as `desk`), so content never sits under the floating nav.
- **Phones and short screens:** a fixed top bar (`h-16`) holds the logo, theme toggle and menu button. The menu slides down beneath it with large `font-display` links and the icon row.
  - It scrolls if it doesn't fit (`overflow-y-auto justify-center-safe`).
  - While it's open, the rest of the page is `inert` and doesn't scroll.
  - Escape closes it and returns focus to the menu button.
- **Focus:** every nav control shows a 2px cyan focus ring (`FOCUS_RING` in `navConfig.ts`).
- **Logo name:** the logo's accessible name starts with its visible "GC", so voice-control users can say what they see.

### Cards (`.card-glass`)
- `rounded-xl overflow-hidden`
- Image header: `h-44`, fallback uses gradient + `.grid-bg` + display initial
- Role label: `font-mono-label text-xs text-cyan-400/80 uppercase tracking-widest`
- Title: `font-display text-lg font-bold text-white`
- Description: `text-sm text-slate-400 leading-relaxed`
- Footer divider: `border-t border-white/6`
- Links: `font-mono-label text-xs`, live = `text-cyan-400`, source = `text-slate-500`

### Buttons

| Variant | Classes |
|---|---|
| Primary | `btn-glow px-7 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm` |
| Secondary | `px-7 py-3 rounded-lg border border-indigo-500/40 text-slate-300 hover:text-white hover:border-cyan-400/60 font-semibold text-sm transition-all` |
| Tertiary | `px-7 py-3 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 font-semibold text-sm transition-all` |

### Status Badge
```tsx
<div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/5">
  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
  <span className="font-mono-label text-xs text-green-400 tracking-widest uppercase">
    Available for opportunities
  </span>
</div>
```

### Tech Badges
```tsx
<span className="font-mono-label px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
  {tech}
</span>
```

### Tech Stack (`src/components/skills/`)
The "What I Work With" block in About. It has one row per category in `shared/data/skills.ts`.
- **Layout:** rows are split by hairlines (`border-white/[0.07]`, light theme `slate-200`). From `md`, the left third of each row holds the category glyph, name and skill count, and the right two thirds hold the skills. On phones the name and count share a line above the skills.
- **Logos:** each skill with a logo gets a 44px tile (`size-11 rounded-xl`) holding a 20px Simple Icons mark. The marks come from the `simple-icons` package (CC0), looked up by name with `getTechIcon()` in `src/lib/techIcons.ts`. Skills with no mark come after the logos as `font-mono-label text-xs` pills. Today those are Playwright, Zustand, Genkit, Google Stitch, and concepts such as "RAG Pipelines". Keep one tool per entry in the data, since one tile can show only one logo.
- **Brand colour:** each logo takes its brand hex through `readableOn()` (`src/lib/brandColor.ts`), so it reads at 3:1 or better on the tile in each theme:
  - Dark brand colours lighten on dark tiles, and pale ones deepen on light tiles.
  - Black and grey marks (Next.js, Vercel, GitHub) take the text colour instead.
  - The two results travel as `--mark-dark` and `--mark-light`, and `--mark` points at the current theme's.
- **Interaction:** hovering a skill with a mouse, or tapping it on touch or pen, makes it active:
  - The tile lifts, and its border, fill and glow tint to `--mark`.
  - A tooltip names the skill. It uses decoder text on a fast spring (`spring={{ stiffness: 600, damping: 50 }}`).
  - The rest of that row dims to 40%.
  - A 90 ms grace period stops the row flashing while the pointer crosses the gaps between tiles. Escape, or a tap outside the skills, clears it.
  - The tooltip slides sideways to stay 8px inside the screen, while its pointer stays on the logo.
- **Logos / Text toggle:** a segmented control of `aria-pressed` buttons with a sliding `layoutId` thumb. Text view shows every skill as a pill, with a dot in its logo colour (or the cyan accent when it has no logo), and replays the staggered entrance.
- **Motion:** rows fade up on scroll using the core easing, and skills pop in on a spring 35 ms apart. The block sits inside `MotionConfig reducedMotion="user"`, so reduced motion keeps the fades, drops the movement, and shows tooltip names without the scramble.
- **Accessibility:**
  - Each category is an `h4` that labels its `ul`. The `ul` carries `role="list"`, because Safari drops list semantics under `list-style: none`.
  - Every logo tile carries its name in `sr-only` text, so the tooltip is `aria-hidden`.
  - Keyboard users can't hover, so the hint points them to the Text view.

### Projects Showcase (`src/components/projects/`)
The Projects section is a pinned scroll through every project, engineering first, then QA. The order, taglines and device settings live in `shared/data/projects.ts`.
- **Scroll:** a full-height stage (`sticky top-0 h-svh`) stays put while one invisible step per project scrolls behind it. Each step is 75svh, and the last is a full screen. The step crossing the middle of the viewport picks the project (`useActiveStep`, the same midline the nav uses). After the last step the stage scrolls away and Contact follows.
- **Panel:** left of the devices from `lg`, below them on smaller screens. Top to bottom:
  - an index line (`01 / 11`) after a gradient bar
  - a `font-mono-label` meta line (`Professional · Full-Stack Developer`)
  - the title in Syne; `titleSizeClass` steps long names down
  - a one-line tagline
  - the stack: up to six 40px logo tiles for engineering (marks via `getTechIcon()` and `readableOn()`, as in Tech Stack) or up to four chips for QA. The overflow becomes "+N more", and the hidden names stay in `sr-only` text.
  - a primary "View more →" button

  Every panel stays in the DOM and only the active one is visible. Keyboard focus on a hidden panel scrolls to its project.
- **Devices:** a 3D laptop, plus a phone when `showPhone` is set, modelled in code with three.js (`src/components/three/devices/`, lazy-loaded inside `DecorativeBoundary`).
  - **Screens:** the laptop shows `imageUrl`, cover-cropped to 16:10; `screenFocusX` (0–1, default 0.5) picks which side of a wider shot to keep. The phone shows `mobileImageUrl`, or a generated placeholder (the project's initial on the site gradient) until one exists. Screenshots cross-fade over 350 ms.
  - **Finishes:** `silver`, `black` or `white`, set by `deviceFinish`, tweening between projects. Neighbouring projects never share one.
  - **Motion:** the lid swings open and the phone springs up the first time the stage is in view, and the devices lean toward the cursor. When a project has no phone, the laptop slides to the centre.
  - **No WebGL:** the desktop screenshot shows on its own.
- **Background:** concentric indigo rings and a soft glow centred on the devices (`StageBackground`), fainter in the light theme.
- **Progress:** a segmented bar at the bottom of the stage, grouped Engineering / QA Engineering, with the current segment in cyan. Clicking a segment jumps to that project. It is a mouse shortcut, so it is `aria-hidden` and out of the tab order.
- **View more:** a native `<dialog>` with the full description, the whole stack as tech badges, and the screenshots. It has no demo links.
- **Reduced motion:** no intro, no lean, and instant screen and finish changes; jumps skip smooth scrolling. The stage still pins.
- **Screenshots:** WebP files in `public/projects/`, with desktop shots 1440px wide. A 16:10 capture (for example 1440×900) fills the laptop screen without any crop.

### Chatbot (orb + holo terminal)
The AI chat is a living orb in the bottom-right corner that opens a HUD-style terminal. The parts live in `src/components/chat/`, the orb's scene in `src/components/three/chatOrbScene.ts`, and `Chatbot.tsx` wires them together.
- **Orb (the button):** the hero sphere's noise shader and indigo → cyan palette at 0.55 of the hero's displacement, so it reads as a soft blob at 64px (72px from `sm`). It breathes, spins slowly, leans toward a pointer within 400px and grows on hover, with a breathing indigo halo behind it.
  - It's lazy-loaded inside `DecorativeBoundary`. A CSS gradient orb holds its place until the first frame, and for good without WebGL.
  - While the chat is open, the orb shrinks away and a cyan-ringed × takes its place. The orb pauses then, and while the tab is hidden.
- **Terminal:** 350×476 from `sm`, the screen width minus 16px gutters on phones. Its height is capped at `calc(100dvh - 13rem)` so it clears the top bar.
  - It swings open on its right-edge hinge from -96° and lands at rest (rotateY -24°, rotateX 2°), angled toward the page. It turns to -9° on hover and faces the visitor (0°) once they type, press inside or tab in.
  - The focus the terminal places in the input on opening doesn't count as engaging, and engaging beats hover.
  - Touch, narrow screens and reduced motion always face straight on. framer-motion drives the angles; the `.chat-*` rules in `index.css` are the look: glass, corner brackets, scanlines, caret and keycaps.
- **Header and status:** `> ask_genessis` with a blinking caret. The status reads ONLINE (green), INPUT (cyan) while typing, or PROCESSING (indigo) while waiting.
- **Messages:** `GENS.AI ›` replies sit on a cyan rule, and `YOU ›` lines sit in an indigo box.
  - Replies decode in with the hero's code glyphs, behind a 10-character frontier, in at most 2s. The final Markdown layout is reserved from the first frame, and screen readers get the real text once.
- **Keys:** three suggested questions ("What does Gens build?", "AI experience?", "Open to work?") are 3D keycaps that press down. Each disappears once asked, and they lock while waiting. Send is a `⏎ Enter` keycap.
- **Focus:** the input gets focus 150ms after opening, unless the chat is already closing. Escape and [×] close it and return focus to the orb.
- **Reduced motion:** a still orb, a fade instead of the swing, no scan band or caret blink, and replies appear at once.

### Rocket Cursor (`src/components/cursor/`)
The site cursor is a small rocket pointing up-left. Its nose is the click point.
- **Cursor image:** a real CSS cursor, not a drawn element, so it never lags and still shows over the project dialog in the top layer. The rules sit at the end of `index.css` and apply once `RocketCursor` puts `.rocket-cursor` on `<html>`. The portfolio page has it and `/resume` doesn't.
  - The art is 32px (`assets/cursors/rocket.svg`), shipped as 1x and 2x PNGs through `image-set()` with a plain `url()` fallback. The nose (6, 6) is the hotspot. Cursors stay at 32px or below, because browsers drop larger ones near their own UI.
  - Links, buttons, labels and `.cursor-pointer` show `rocket-lit`, the same rocket with a cyan flame. Text fields keep the I-beam, and disabled controls keep their own cursor.
  - It applies to mouse and trackpad only (`(hover: hover) and (pointer: fine)`). Touch is untouched, and Windows high-contrast mode (`forced-colors: active`) keeps the system cursors.
- **Exhaust:** a click-through, full-window canvas (`z-100`, `aria-hidden`) draws puffs from the nozzle, 16px right and below the nose.
  - Puffs cool from white-hot through cyan to indigo and fade within about half a second. On the light page they are deeper cyan and indigo with normal blending, since additive glow would vanish.
  - The engine burns denser over links and buttons, and a click fires a boost.
  - There's no exhaust over text fields, over the page scrollbars, or inside the open project dialog, which sits above the canvas.
  - The canvas is sized to its own box, so a classic scrollbar doesn't stretch it.
  - It's hidden and asks for no frames while there are no puffs.
  - The lit rocket image is fetched up front, so the first hover over a link doesn't flash the system hand.
- **Reduced motion:** the rocket stays but there is no exhaust.
- **Keeping CSS and code in step:** `cursorRules.ts` mirrors the selectors and media query from `index.css`, and `cursorRules.test.ts` fails if they drift.
- **Editing the art:** re-export both PNGs from the SVG after editing it. Vite keeps the PNGs out of the stylesheet (`assetsInlineLimit` in `vite.config.ts`), so they never block first paint.

### Gradient Blobs (decorative)
```tsx
// Primary blob — indigo
<div style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
// Secondary blob — cyan
<div style={{ background: 'radial-gradient(ellipse, rgba(34,211,238,0.07) 0%, transparent 70%)' }} />
```

---

## Motion / Animation

**Library:** Framer Motion

### Core Easing
`[0.22, 1, 0.36, 1]` — custom spring-out, used everywhere for entrance animations.

### Fade-Up Entrance
```tsx
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  }),
}
// usage: custom={0.1} variants={fadeUp} initial="hidden" animate="visible"
```

### Stagger Pattern
Each child increments `delay` by `0.1` (0, 0.1, 0.2, 0.3...).

### Scroll-Triggered (cards, sections)
```tsx
initial={{ opacity: 0, y: 32 }}
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true, margin: '-60px' }}
transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
```

### Mobile Menu
```tsx
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
```

### Decoder Text (hero name)
```tsx
<DecoderText text="Genessis" delayMs={300} />
```
- Scrambles through code characters (brackets, operators and hex digits, in JetBrains Mono at 80% opacity) and resolves left to right on a framer-motion spring (`stiffness: 8, damping: 5`). Monospace glyphs are about as wide as the display letters, so the scramble stays close to the final width.
- An invisible copy of the final text reserves its width, and the scramble is anchored at the start, so settled letters stay in place while glyphs swap.
- Reduced motion: the final text appears immediately.

### Rotating Words (hero role line)
```tsx
<RotatingWords words={['Full Stack Developer', 'QA Engineer', 'AI Engineer', 'Software Engineer']} />
```
- Shows the next word every 5 s (`intervalMs`). Each word is revealed by a cyan block wipe (`bg-cyan-400`, light theme `bg-cyan-600`) lasting 1.5 s after a 0.6 s delay, on the core easing.
- Screen readers hear the whole list once ("A, B, C, and D"), not a new word every few seconds.
- Reduced motion: first word only, with no rotation and no wipe.

### Galaxy (hero background)
- React Bits' Galaxy, a self-contained WebGL2 star field, lazy-loaded in its own chunk (`React.lazy`) inside `DecorativeBoundary`, so it never delays first paint and a failure only removes it.
- Stars use the site palette (`#818cf8`, `#22d3ee`, `#6366f1`) and draw see-through over the grid and the gradient blobs. On the light theme they turn to ink-tinted stars.
- They warp in over about 2 s, then drift toward the viewer while the field turns slowly. The cursor pushes nearby stars aside, and a click inside the hero sets off a short warp.
- It pauses while off-screen or in a hidden tab. Reduced motion shows a still star field with no intro, drift or warp.
- The dev background lab (`?bg=`, on in dev and in `VITE_BG_LAB=1` builds) still offers the displacement sphere and the other candidates.

Adapted from React Bits (MIT + Commons Clause). See `portfolio/THIRD_PARTY_NOTICES.md`.

### Displacement Sphere (lab alternative)
- A three.js noise-displaced sphere, lazy-loaded in its own chunk (`React.lazy`) so it never delays first paint. Production shows the galaxy instead; the sphere is `?bg=sphere` in the lab, and the chat orb reuses its shader.
- The shader colours it indigo → cyan (`#6366f1` / `#22d3ee`), and it fades in to 85% opacity over 3 s.
- It leans toward the cursor on a spring (`stiffness 30, damping 20, mass 2`), and its lighting follows the theme.
- It pauses while off-screen, draws one still frame under reduced motion, and renders nothing when WebGL is unavailable.

Adapted from Hamish Williams' portfolio (MIT). See `portfolio/THIRD_PARTY_NOTICES.md`.

---

## Layout

- Max content width: `max-w-6xl` (navbar, sections), `max-w-4xl` (hero text)
- Section padding: `px-6 py-24` (desktop), `px-4` (mobile)
- Grid: 3-column cards (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
- Scroll behavior: `scroll-smooth` on `html`
- `min-h-screen` for hero section
- Don't combine `desk:` and `lg:` on the same property. Tailwind emits custom variants after the breakpoint variants, so `desk:` always wins.
- Hero: two lines only, left-aligned inside a centred column using hamishw.com's intro widths (780px, 920px above 1680px, 1024px above 2080px). The block is vertically centred and nudged up: 8vh on phones, 24px on desktop. On desktop, equal `desk:px-32` side padding keeps the column clear of the side nav and truly centred. Line one is the name on one line, as decoder text. It's white plus a glowing `text-indigo-400` surname in dark, and slate-900 plus `light:text-indigo-600` in light, which keeps the surname above 3:1 contrast. Line two is the rotating role. Under reduced motion the entrance is a plain fade (no slide). There is no scroll-down hint. A bottom gradient melts the galaxy into the page colour. The portrait is paused for now; the cut-out photo is kept in `src/assets/portrait*.webp` for later.

---

## Tone & Voice

- Heading labels: ALL CAPS, letter-spaced monospace
- Copy: direct, technical, confident ("I build…", "combining clean frontend engineering with…")
- No buzzword overload; specificity preferred ("RAG pipelines, LLM integrations" over "AI solutions")
- Punctuation in brand logo: `GC.` — the period is accented cyan with glow

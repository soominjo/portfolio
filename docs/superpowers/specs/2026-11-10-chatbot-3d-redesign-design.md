# Chatbot 3D redesign: design

**Date:** 2026-11-10
**Status:** Reviewed, waiting for Genessis's approval
**Mockups:** In `.superpowers/brainstorm/4118-1794302664/content/` (local only, not in git):
- `chat-combo.html` shows the chosen design. It's version 2, the right-hand stage.
- `chat-3d-directions.html` shows where the parts came from: the orb is from A and the terminal is from C.

The mockups were quick prototypes. They use katakana glyphs, canned answers and `innerHTML`, so use them for look and motion only, not for code.

## Why

The site now has a 3D hero: a noise-displaced sphere, decoder text and rotating roles. The chatbot is still a generic flat widget: an indigo header bar, a "G" avatar and a round indigo button. Next to the hero it looks like a different site. Genessis, the site owner, wants the chat to be 3D and interactive like the hero, so a visitor who opens it feels they are still on the same site.

## What visitors get

### The button: a living orb (from mockup A)

- A small copy of the hero sphere, using the same noise shader and the same indigo (`#6366f1`) to cyan (`#22d3ee`) palette. It replaces the round indigo button in the same fixed bottom-right spot.
- The box is about 72px on desktop and 64px on phones. A soft indigo-to-cyan halo behind the orb breathes slowly, on a cycle of about 3 seconds.
- The orb is alive while it waits. The noise drifts, the orb spins slowly and breathes by about ±2% in scale, and it leans toward the cursor when the cursor is near: a small, spring-smoothed rotation plus position offset. On hover it grows about 8%.
- Its surface is softer than the hero's: the noise displacement is about 55% of the hero's, so at button size it reads as a soft blob rather than spikes. Lights are a little brighter than the hero's in the dark theme.
- **While the chat is open (version 2, chosen by Genessis):** the orb shrinks and fades away, and a × in a cyan-ringed dark glass circle rotates in at the same spot. Clicking it closes the chat. When the chat closes, the orb comes back.

### The chat window: a holo terminal (from mockup C)

**Shape and motion**
- The window is a HUD-style panel, about 350×476px on desktop, sitting above the orb in the bottom-right corner.
- At rest it is angled in 3D: rotated about -24° around its right edge, with the vanishing point to its left, so it looks like a screen turned toward the middle of the page.
- **Opening:** the panel swings in on its right-edge hinge, from edge-on and invisible, and lands at the resting angle of -24°. Closing reverses the swing.
- When the pointer is over it, it turns to about -9°.
- It faces the visitor straight on (0°) once they engage with it: typing, pressing or clicking inside it, or moving focus into it with the keyboard.
  - The focus the chat itself puts in the input on opening doesn't count as engaging, so the panel still lands at -24°.
  - Engaging beats hovering, so the text stays straight while the visitor types even with the pointer over the panel.
  - The panel returns to its resting angle when focus leaves it.
  - Plain CSS `:hover` and `:focus-within` can't tell the chat's own focus from the visitor's, so this needs a small piece of JavaScript state. The mockup didn't hit this because it never moved focus on open.
- These turns ease over about 0.9s on the site's easing `[0.22, 1, 0.36, 1]`.

**Look**
- Dark theme: near-black glass with a 1px cyan border, a 6px radius and a faint cyan glow inside and out.
- Cyan L-shaped corner brackets sit in all four corners.
- Faint horizontal scanlines cover the panel, and a soft scan band slides down it on a slow loop.
- Light theme: white glass with cyan-600 (`#0891b2`) accents, the same structure and no heavy glow, as in the mockup's Light mode.

**Header**
- On the left, `> ask_genessis` in JetBrains Mono, with a cyan `>` and a blinking cyan block caret.
- On the right, a status label in small letter-spaced mono with a square dot. It reads **ONLINE** (green) when idle, **INPUT** (cyan) while the visitor is typing and **PROCESSING** (light indigo, dot blinking) while waiting for the AI.
- At the far right, a `[×]` close button.

**Messages**
- Each message has a mono label: `GENS.AI ›` in cyan for the assistant and `YOU ›` in light indigo for the visitor.
- Assistant text is DM Sans at about 13.5px, with a 2px cyan rule on its left.
- Visitor text is right-aligned in a thin indigo-outlined box.
- While waiting, the assistant row shows `PROCESSING` and a row of 8 small blocks that light up in sequence.
- **Replies decode in.** The reply resolves left to right behind a short band of about 10 scrambling characters, using the same glyph set as the hero name (`GLYPHS` in `src/components/motion/decoder.ts`). However long the reply is, the decode finishes within about 2 seconds.
- The welcome message is shown at once, without decoding. Its wording stays exactly as it is today.

**Suggested questions (new)**
- Three 3D keycaps appear above the input:
  - "What does Gens build?"
  - "AI experience?"
  - "Open to work?"
- Each keycap is uppercase mono with a cyan border and a deep shadow underneath, and it presses down when clicked.
- Clicking one sends its text to the real AI as the visitor's message, and that keycap disappears. Keycaps are disabled while waiting for an answer.

**Input**
- The input row has a dashed cyan top border, a `>` prompt and a mono input with the placeholder "type a question…" and a 500-character limit.
- The send button is a keycap labelled `⏎ Enter`. It is disabled when the input is empty or while waiting, and pressing Enter also sends.

### Phones and touch screens

- Phones have no hover, so on touch screens and narrow screens the panel faces the visitor straight on at rest. It still swings open and closed.
- The panel is the screen width minus a 16px gutter on each side.
- Its height is capped so it fits above the orb without covering the phone top bar (`h-16`), and it stays usable when the on-screen keyboard is open.

### Reduced motion, no WebGL, screen readers

- **Reduced motion** (`useReducedMotion()`):
  - The orb draws one still frame, with no leaning or breathing and a static halo.
  - The panel fades instead of swinging and always faces straight on.
  - The scan band and the caret blink stop.
  - Replies appear in full at once.
- **No WebGL, or before three.js has loaded:** a CSS gradient orb shows in the same spot, and everything else works the same.
- **Screen readers:**
  - The orb is a `<button>` labelled "Open chat" or "Close chat", with `aria-expanded` and `aria-controls`.
  - The panel is a non-modal dialog with a label. Opening it moves focus to the input. Escape closes it and returns focus to the orb button.
  - The message list is a polite live region (`role="log"`).
  - Each reply is read once, as its final text. The scrambling copy is `aria-hidden`.
  - Keycaps and Enter are real buttons.
- **Contrast:** all text meets WCAG AA in both themes. The 3D angle is decorative only.

## Behaviour that must not change

- Requests still go to `POST /api/chat` with `{ message, messages }`. `messages` is the earlier conversation without the welcome message, with roles mapped to `'user'` or `'model'`. Responses are `{ success, reply?, error? }`.
- Failed requests still show `Error: <error>` or "Network error. Please try again." as an assistant message.
- The conversation survives closing and reopening the chat while the page stays open. It is not saved across page reloads.
- Assistant replies still render Markdown: paragraphs, bullets and bold. They keep their final layout, with bullets and bold in place, while they decode, so nothing jumps when the decode finishes.
- The chat stays hidden on `/resume`, because `App.tsx` returns early there.
- The chat starts closed when the page loads.

## Goals

1. The chat looks and moves like part of the 3D hero, in both themes.
2. Interactions people can feel: the orb leans and grows on hover, the panel turns toward the pointer, keycaps press down, replies decode in, and the status reacts to typing and waiting.
3. Nothing gets harder to use. Text is readable while chatting, the chat works on phones, and it handles reduced motion, keyboards and screen readers.
4. A Chatbot section in `docs/DESIGN.md` records the new pattern.

## Non-goals

- Changes to the API, the model, the system prompt or the knowledge base.
- Streaming replies.
- Saving the conversation across reloads.
- New 3D models or image assets.
- Changes to any other section of the site.

## Anti-goals (a failure even if it technically works)

- The orb or three.js slows the first paint or the hero.
- Visitors have to read tilted text while chatting.
- Animations that ignore reduced motion.
- A decode so slow that people wait to read the answer.
- The orb draining battery while it's hidden or the tab is in the background.

## Constraints

- **Stack:** React 19, TypeScript 6, Vite 8, Tailwind v4 (the `light:` variant keys off `.light` on `<html>`), framer-motion 12, three 0.187, react-markdown 10, Vitest 5 with Testing Library and jsdom. No new dependencies.
- **TypeScript is strict:** `verbatimModuleSyntax` (use `import type`), `erasableSyntaxOnly`, `noUnusedLocals` and `noUnusedParameters`.
- **three.js:** may only be imported by files in `src/components/three/`, and those files are loaded with `React.lazy`, as the hero sphere is. Load the orb after first paint and show the CSS orb until it's ready.
- **Brand:** tokens, fonts and easing come from `docs/DESIGN.md`.
- **Code rules:** no `innerHTML` (render everything through React and react-markdown) and no `console.log`.
- **Credit:** files adapted from Hamish Williams' portfolio keep the MIT header comment used in `src/components/three/`. `THIRD_PARTY_NOTICES.md` already covers `src/components/three/`.
- **Entry point:** keep the `Chatbot` export in `src/components/Chatbot.tsx` so `App.tsx` doesn't change.
- **Shared working tree:** another Claude session (`portfolio-42`) is rebuilding the Projects section in the same working tree on `feat/hero-animations`.
  - Don't touch `Projects.tsx`, `ProjectCard.tsx`, `shared/types/project.ts`, `shared/data/projects.ts`, `components/projects/`, `components/three/devices/` or `public/projects/`.
  - Message that session before editing `vitest.config.ts`, `THIRD_PARTY_NOTICES.md` or `sphereShader.ts`. This session told it `sphereShader.ts` would only be imported.
  - Don't switch branches, and don't commit unless Genessis asks.
- **Tests:** the repo requires 80% coverage on the files listed in `vitest.config.ts` → `coverage.include`, so the new chat files get added there.

## Existing pieces to reuse

- `src/components/three/sphereShader.ts`: `patchPhongShader()` and `SPHERE_PALETTE`. The softer orb needs a displacement scale. The suggested approach is an optional parameter whose default leaves the hero exactly as it is, covered by `sphereShader.test.ts`.
- `src/components/three/sphereScene.ts`: the pattern for a framework-free scene module. It has the renderer with `failIfMajorPerformanceCaveat`, the light intensities per theme, light swaps that don't recompile the shader, and `dispose()`.
- `src/components/three/DisplacementSphere.tsx`: the pattern for lazy loading, reduced motion, pausing and theme changes.
- `src/components/motion/decoder.ts`: `GLYPHS` and the `shuffle()` rhythm, so the chat's scramble matches the hero name's.
- `src/test/setup.ts` and `src/test/controls.ts`:
  - jsdom has no WebGL, so `getContext` returns null and the orb's fallback path is what tests exercise.
  - `controls.reducedMotion` flips reduced motion.
- The current `Chatbot.tsx`: its fetch, history and error handling, and its react-markdown component overrides.

## Left to the builder

- How the files are split, for example `src/components/chat/` for the UI and logic and `src/components/three/` for the orb scene.
- How the Markdown-aware decode works, as long as the reply keeps its final layout during the decode and finishes within about 2 seconds.
- How "the visitor has engaged" is detected. For example, a flag set by keydown, pointerdown or a keyboard focus move inside the panel that skips the focus placed on open, and cleared on focusout to outside the panel or on close.
- The orb's exact numbers: radius, segments, light intensities, lean strength and spring settings. Match the feel of the mockup.
- Whether the 3D and HUD styling (corners, scanlines, keycap shadows, keyframes) lives in `index.css` or in Tailwind arbitrary values.
- How the tests are structured. Pure logic, such as decode frames, history building and status changes, gets unit tests. The component gets tests for open and close, Escape and focus return, sending, keycaps, the waiting state, both error paths, and reduced motion. jsdom can't check the 3D CSS, so check it in a real browser too, as the hero work did with headless Chrome screenshots.

## Decided by Genessis

- Button: mockup A's living orb.
- Chat window: mockup C's holo terminal.
- While the chat is open, the orb turns into a × (version 2), rather than staying on screen.
- The chat should be interactive, not just styled in 3D.
- How the panel lands when it opens was left to the designer ("apply what's best"). The answer is below.

## Calls made in the design conversation (Genessis can still change them)

- The panel lands tilted at -24° and straightens only when the visitor engages, as described under "Shape and motion". It does not open already facing straight on, because then most visitors would never see the 3D angle that was the reason for picking the terminal.

- Phones face straight on, as described above.
- Reduced motion is handled as described above.
- Real replies keep their Markdown formatting.
- Screen readers hear each reply once.
- The AI, the welcome message and the three suggested questions are as listed above.
- The scramble uses the hero's code-character glyphs, not the katakana in the mockup.
- Used keycaps disappear, and keycaps are disabled while waiting.

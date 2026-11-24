# Contact redesign: "Hi there" block and a `/contact` form page

Date: 2026-11-15 · Status: awaiting the user's approval · Branch: `feat/hero-animations`

## Intent

Two changes:

- **Homepage.** The Contact section becomes a personal closing block, laid out like the "Hi there" profile section on hamishw.com. It has a short "who I am" bio on the left, the user's photo on the right, and a "Send me a message" button.
- **Form page.** The form moves to a page of its own, `/contact`, which shows only the form. That page uses this site's own look, a sibling of the chatbot's holo terminal, not Hamish's styling. From Hamish it keeps only the idea of name, email and message.

**Why:** the user wants their identity, not a bare form, to close the homepage. They want a focused page for writing to them, and that page has to feel like part of this site.

Live mockups (gitignored, open them through the brainstorm companion or straight from disk):
- `.superpowers/brainstorm/844-1794744390/content/contact-picked.html` is the approved flow. "Send me a message" opens the form page, and "← Back to portfolio" returns.
- `contact-mockups.html` in the same folder holds all the options the user chose between.

## What the user decided (2026-11-15)

1. **The bio moves.** The whole bio leaves About for Contact (option B, "move it all"). That covers both paragraphs and the "Send me a message" link.
2. **Homepage look.** The user picked option A: the photo sits in a holo frame on the right.
3. **About's top goes.** The whole `// about.sys` block is removed: the label, the "Full-Stack Engineer · AI/LLM Integrations · QA Engineer" heading and the `profile.json` facts card. About now opens straight on Experience.
4. **Form page look.** The user picked option A, the terminal.
5. **Navigation to the form.** "Send me a message" goes to a new page that shows only the form.
6. **Calls approved at playback** (the user said "nothing, proceed"):
   - The side nav drops "About".
   - The photo is cropped to head and shoulders.
   - The email no longer appears on the homepage.
   - On phones, the bio stacks above the photo.
7. **No confirmation-email promise.** The user picked A: the sent screen says only "✓ delivered" and "I'll reply within 24 hours".
   - The visitor auto-reply in `api/contact.ts` is sent from Resend's shared test sender, `onboarding@resend.dev`, which only delivers to the account owner. `docs/TDL.md` still has "verify your domain" unticked.
   - So most visitors never get that email, and the handler hides the failure by returning 200.
   - Fixing the sender (a verified domain plus a new `from` address) is a separate follow-up, outside this redesign. Once it's done, the line can come back.

## Goals

- The homepage Contact block matches the approved mockup in dark and light, on desktop and phone.
- `/contact` works three ways: from the button (no reload), from a shared link, and after a refresh.
- Browser Back and Forward behave as if these were two normal pages. Coming back lands on the Contact block, not the top of the homepage.
- The form keeps everything the current one does:
  - client checks that match `/api/contact`
  - a guard against double-sending
  - server errors shown with the visitor's text kept
  - a confirmation after sending
  - full keyboard and screen-reader support
- Nothing on the page says "who I am" twice, and no link goes nowhere.

## Non-goals

- Changes to `/api/contact`, its validation or its emails (`api/`).
- Restyling Experience or the tech stack.
- Hero or Projects work, which other sessions own (see Constraints).
- A chatbot redesign. The chatbot only gains a pause flag (see Page switching).
- A routing library, or any new npm dependency.

## Anti-goals

The build fails if any of these happen, even when it technically works:

- The form page feels like a different site, or borrows Hamish's look (notched divider, floating labels, cut-corner buttons).
- Going to `/contact` or back does a full reload, or drops the visitor at the top of the homepage.
- The Hytel and Flinki bio links, or their tests, are lost in the move.
- The homepage keeps rendering WebGL behind the form page.

## Approaches (how `/contact` is reached)

1. **Full page load:** `/contact` is detected at startup, as `/resume` already is in `App.tsx`, and the button is a plain link. It's the simplest. But every visit reloads the whole site, 3D chunks included, and Back reloads the homepage at the top, because WebGL pages rarely qualify for the browser's back-forward cache.
2. **In-app switch (picked):** `/contact` is still a real address. A direct visit or a refresh renders the form page at startup, and Vercel's existing catch-all rewrite already serves `index.html`. The button calls `history.pushState` and swaps the view without a reload, wrapped in `document.startViewTransition` where it's supported. `useTheme` already uses that call for the theme wipe. `popstate` handles Back and Forward. It needs a small hook and no dependency.
3. **React Router:** a real router, but it's a new dependency for one page. `npm install` is unsafe while other sessions share this working tree, and `/resume` would have to move as well.

**Why 2:** the user handed over the how ("proceed"). Option 2 is the only one that gives a no-reload switch and a Back that lands where the visitor left, without a dependency.

## Design

### Homepage: the Contact block (`section#contact`)

**Layout** (after Hamish's profile section):
- Two columns inside the usual section shell (`clear-side-nav`, the section background `#070b14` and `light:bg-white`, and the top hairline glow other sections use).
- The left column flexes; the right one is about 46–50% wide with a 48px gap. The block's maximum width is about Hamish's 1096px.
- On desktop the right column starts about 130px lower than the left, as in the mockup.
- Phones and narrow screens get one column: the bio first, then the frame, centred, up to 440px wide, with no offset.

**Left column, top to bottom:**
- `// get.in.touch` in the site's label style.
- "Hi there" as the section's `h2`, in Syne, about 38px on desktop. It decodes in with `DecoderText` the first time the block scrolls into view (the `useInView` gate already exists in `contact/ContactForm.tsx`), not on page load.
- The two bio paragraphs, moved word for word from `About.tsx`, in `text-lg`, `leading-relaxed`, `text-slate-300` (`light:text-slate-700`). "Hytel" and "Flinki" stay external links through `ExternalBioLink`, which also moves (see "Reused and removed code").
- "Send me a message": cyan semibold text with the send icon, which shifts right on hover. It's a real link with `href="/contact"`, so it still works with JavaScript off and on middle-click or Ctrl-click. A plain click is intercepted to switch in-app (see Page switching).

**Right column:**
- A tag line: a 64×3px indigo→cyan gradient bar, then `profile.webp` in the mono label style.
- The holo frame (`contact-picked.html` has the exact look):
  - Chat-terminal glass: the `.chat-terminal` background, border and glow, the four `.chat-corner` brackets and `.chat-scanlines`.
  - Head row: `~ genessis/profile.webp` on the left, a green `AVAILABLE` status (the `.chat-status` look) on the right.
  - Body, about 430px tall: a faint cyan grid masked to an ellipse, a soft indigo radial glow, and the cut-out portrait.
  - Foot row: `GENESSIS S. CONTRERAS` on the left, `CAVITE · PH` on the right, in letter-spaced mono.
- **Portrait:**
  - Sources: `src/assets/portrait-640.webp`, with `portrait.webp` (1100w) offered through `srcset`. Both are transparent cut-outs.
  - Crop: head and shoulders. The image is anchored near the top and drawn about 118% of the body's height, so the bottom of the photo stays outside the frame. That bottom holds a small sparkle watermark at about 90% of the image's height, on the right pocket, and it must never show.
  - Markup: `alt="Genessis Contreras"`, explicit width and height, and `loading="lazy"`.
- Light theme: the chat terminal's existing light variants (`.light .chat-*`).

**Motion:** the bio and the frame fade up once on scroll, using the core easing from DESIGN.md. The frame follows about 0.1s after the bio. The scan band animates, as in the chatbot. Under reduced motion only the fades remain: no slide, no scan band, and "Hi there" appears without the scramble (`DecoderText` already handles that).

### Homepage: About (`section#about`)

- Remove the header block (`// about.sys` and its `h2`) and the two-column grid: the bio, the "Send me a message" link and the `profile.json` facts card. The `facts` array and `fadeUp` go too if nothing else uses them.
- The section keeps `id="about"`, its padding and its hairlines. It now opens on the Experience header (`// career.log`), followed by the tech stack. `App.test.tsx` expects the ids `hero`, `projects`, `about`, `contact` in that order.

### Side nav and phone menu

- `NAV_LINKS` becomes Projects (`#projects`), Experience (`#experience`), Contact (`#contact`). The side nav and the phone menu both read it.
- **"Experience" stays current while the tech stack crosses the middle of the viewport.** Today the tech stack sits outside `#experience`, inside `#about`. With "About" gone from the nav, nothing would be highlighted there. One fix is to move the `experience` id to a wrapper around both the timeline and the tech stack. Either way, the `#experience` anchor must still land at the Experience header.
- Update `Navbar.test.tsx`. Its About cases, such as "prefers Experience over About while both cross the middle", no longer apply.

### The form page (`/contact`)

**Chrome only, no homepage parts:**
- Top row (about 28px padding on desktop, 16px on phones):
  - `GC.` logo, which goes home like the back link
  - "← Back to portfolio", a bordered mono button
  - the existing `ThemeToggle` component, on the right
- Not rendered: side nav, footer and chatbot. The rocket cursor stays, since `/resume` is the only page without it.
- The background is the page colour `#05070f` (light `#f7f9fc`) with the 60px grid.

**Content, centred, up to about 590px wide:**
- `// get.in.touch`, then the `h1` "Send me a message" in Syne, about 34px.
- **The terminal form** (`contact-picked.html` has the look):
  - **Head row:** `> new_message` with the blinking `.chat-caret` on the left, and the status on the right, styled with `.chat-status`:
    - `ONLINE` (green) while idle
    - `INPUT` (cyan) while any field has focus
    - `SENDING` (indigo, blinking) while a send is in flight
  - **Comment line:** `// replies within 24 hours`.
  - **Three prompt rows,** each a real `<label>` around its field:
    - Keys `name ›`, `email ›` and `message ›` in mono indigo, with the chevron in cyan. Input text is DM Sans 15px.
    - The focused row gets a 2px cyan left bar and a faint cyan wash, and its key turns cyan.
    - Rows are split by faint cyan hairlines.
    - Message is a textarea about 4 rows tall, with no resize handle.
  - **Footer row:** the hint `CTRL + ⏎ TO SEND` on the left (show `⌘ + ⏎` on Apple devices), and a `.chat-key` keycap button, `⏎ Send message`, on the right.
- **Fields:**
  - Names, `autocomplete` values and `maxLength`s as now: name (`name`, 100), email (`email`, 254) and message (`off`, 2000).
  - Checks use `contactSchema.ts`, which mirrors `/api/contact`.
  - Ctrl+Enter or ⌘+Enter submits from any field. A plain Enter in the textarea adds a new line.
- **Errors:**
  - Field errors appear as a red mono line under their row: `✗ Please enter a valid email address`.
  - Each one is linked by `aria-describedby` and is a `role="alert"`, because react-hook-form focuses the field before the error renders.
  - The first invalid field takes focus.
- **Sending:**
  - The keycap reads `SENDING…`, carries `aria-disabled`, and stays focusable.
  - A lock stops a second send from any source: a click, Enter, or Ctrl+Enter. The lock releases on an error and stays on after a send.
  - A visually hidden `role="status"` line announces "Sending your message…".
- **Server or network error:** a red line above the footer, `✗ <server's message>`, or `✗ Something went wrong. Please try again in a moment.`, as a `role="alert"`. Typed text is kept.
- **Sent:**
  - The rows are replaced by the terminal log:
    - `> sending message… done`
    - `✓ delivered` (green)
    - `> I'll reply within 24 hours.`
  - The log makes no promise of a confirmation email (decision 7).
  - Below the log, two keycaps: `↺ New message` (an empty form, focus on name) and `← Portfolio` (the same as the back link).
  - Focus moves to the log, which carries `tabIndex={-1}`.
  - The indigo and cyan confetti from the current form fires from the keycap, with `disableForReducedMotion`.
- **Phones:** the terminal fills the width with 16px gutters. Below about 400px, each key sits above its field instead of beside it.
- **Reduced motion:** no scan band, no caret blink, and no cross-fade between pages.

### Page switching

- `App.tsx` already returns `<Resume />` for `/resume`. Add a small route hook that returns the current path. It updates on `popstate` and on its own `navigate(path)`, which calls `history.pushState` and runs the view swap inside `document.startViewTransition` when that exists and reduced motion is off.
- **The button, in the Contact block:** a plain left click (no modifier keys) calls `navigate('/contact')`. Before leaving, it stores the homepage's `scrollY` in the current history entry with `history.replaceState`.
- **Arriving at `/contact`:**
  - Scroll to the top.
  - Set `document.title` to "Contact — Genessis Contreras".
  - Move focus to the `h1` (`tabIndex={-1}`), so screen readers announce the new page.
- **"← Back to portfolio", the `GC.` logo and the `← Portfolio` keycap:**
  - If the visitor reached `/contact` from inside the site, they call `history.back()`. The entry stays clean, and the browser's Back button does the same thing.
  - If they landed on `/contact` directly, they `navigate('/#contact')`.
- **Returning to `/`:**
  - Restore the stored `scrollY`. With no stored value, scroll to `#contact`.
  - Restore the homepage title.
  - Return focus to "Send me a message".
  - There should be no visible jump.
- **Refresh and direct visits:** a refresh on `/contact` shows the form page. A refresh on `/` behaves as now.
- **Homepage state while `/contact` shows:** the homepage stays mounted but hidden (`hidden` plus `inert`), along with the navbar, the footer and `<Chatbot />`. Back is then instant, the scroll position can be restored exactly, and an open chat conversation (`useChat` state inside `Chatbot`) survives the trip.
  - The hero background, the project devices and the Projects backdrops already stop rendering when hidden. Confirm that in the build.
  - The chat orb doesn't stop on its own. Its loop in `three/ChatOrb.tsx` stops only for its `paused` prop (true while the chat is open), reduced motion, or `document.hidden`.
  - So pass a "page hidden" flag from `App` through `Chatbot.tsx` and `chat/ChatLauncher.tsx`, and render `<ChatOrb paused={open || pageHidden} />`.
  - Nothing may keep rendering WebGL behind the form page. Verify that with a frame counter or a CDP performance trace.

### Reused and removed code

**Keep and reuse:**
- `contact/contactSchema.ts` and its test.
- The send logic in `contact/ContactForm.tsx`: the in-flight lock, `readServerError`, the fallback message and `fireConfetti`. Move it into the new terminal form or a `useContactSubmit` hook.
- `motion/DecoderText.tsx`.
- `ThemeToggle`.
- The `.chat-*` classes in `index.css`, used as they are. If renaming would help, ask the user first, since peers share that file.

**Move from About.tsx into the Contact block, unchanged:**
- `ExternalBioLink`, the `bioLinkClass` constant it uses, and the `import type { ReactNode } from 'react'` it needs.
- The two link tests from `About.test.tsx`, into the Contact tests. They match the name with the regex `/^Hytel ?\(opens in a new tab\)$/`, because jsdom drops the space before the `sr-only` note. Keep that regex.
- Delete `About.test.tsx` if nothing is left in it, or keep it for About's remaining content.

**Delete** these leftovers of the earlier Hamish-style form, which shipped nowhere and are uncommitted:
- `ContactField.tsx` (and its test)
- `SendButton.tsx`
- `NotchDivider.tsx`
- `MessageSent.tsx`
- `contactMotion.ts`
- `contactStyles.ts`
- the unused icons in `ContactIcons.tsx`

Rewrite `ContactForm.test.tsx` and `sections/Contact.test.tsx` for the new UI. Keep every behaviour they cover: no send on invalid input, the lock, server and network errors, the sent state, starting a new message, and confetti respecting reduced motion.

### Docs

- **`docs/DESIGN.md`:**
  - Replace the current "Contact" entry with the Contact block and the `/contact` page.
  - Note in the Navbar entry that the links are Projects, Experience and Contact.
  - Edit with exact matches after a fresh read. Other sessions edit this file.
- **`portfolio/THIRD_PARTY_NOTICES.md`:** rewrite the `src/components/contact/` clause in the Hamish entry. It now covers the "Hi there" block's layout, after his profile section, and his send icon path if it's used. Drop the parts that no longer exist (notched divider, floating labels, cut-corner buttons).

## Constraints

- **Other Claude sessions share this working tree.** Re-read files right before editing, use exact-match edits on shared files, and never run `npm install`.
  - **portfolio-4e:** Projects backdrops. It edits `App.tsx`, but only the `<Projects />` line, plus the Projects Showcase bullet in DESIGN.md.
  - **portfolio-45:** hero background. It edits the hero lines in DESIGN.md.
  - **portfolio-18:** finished in `About.tsx`. Its code reviewer may still flag something, and it will message before touching About again.
- The chatbot files (`Chatbot.tsx`, `chat/ChatLauncher.tsx`, `three/ChatOrb.tsx`) are committed and no session claims them. Announce before editing them.
- `/resume` keeps working, without the rocket cursor.
- **Tests:**
  - Run vitest from PowerShell (`C:\`). Running it from Bash's `c:\` path loads vitest twice.
  - jsdom has no layout. Check the look in headless Edge over CDP: dark and light, 1440×900, 1280×720 and 390×844. Production also shows Particles in the hero now (portfolio-45).
- Commits happen only when the user asks.

## Left to the builder

- File and component names and structure. Keep files small (200–400 lines).
- Exact entrance timings within DESIGN.md's easing, and whether the message textarea grows with its text.
- How the narrow-phone layout for the prompt rows is achieved.

## Calls made without asking (for the user to check)

- The homepage stays mounted but hidden while `/contact` shows. Back is instant, and an open chat survives; the chat orb pauses through a new flag.
- "Hi there" decodes in on scroll, like the hero name.
- The confetti stays, from the terminal keycap.
- The status line has three states (ONLINE, INPUT and SENDING), as in the chatbot.
- The `GC.` logo on `/contact` goes back home, like "← Back to portfolio".
- The rocket cursor stays on `/contact`.
- The `/contact` tab title is "Contact — Genessis Contreras".

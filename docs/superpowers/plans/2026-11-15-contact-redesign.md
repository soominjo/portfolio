# Contact Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The homepage Contact section becomes a "Hi there" bio block with a holo-framed photo. About loses its top, the side nav shrinks to Projects · Experience · Contact, and a new in-app `/contact` page holds a terminal-style form.

**Architecture:**
- **Router:** a small module (`useRoute`, `navigate`, `goBackOr`, `savedScrollY`) built on `history.pushState` and `popstate`. It drives `App`: `/resume` stays as it is, and `/contact` renders `ContactPage` while the homepage stays mounted but `hidden` and `inert`.
- **Form:** split three ways, all styled with the existing `.chat-*` classes:
  - `useContactSubmit`, the send logic lifted from today's `ContactForm`
  - `PromptRow`, one field row
  - `TerminalForm`, the form itself

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, framer-motion 12, react-hook-form 7 with zod 4, canvas-confetti, Vitest 5 with Testing Library (jsdom).

**Spec:** `docs/superpowers/specs/2026-11-15-contact-redesign-design.md`. Read it alongside this plan. The approved mockup is `.superpowers/brainstorm/844-1794744390/content/contact-picked.html` (gitignored; open it from disk).

## Global Constraints

- **Dependencies:** none new. Never run `npm install`; other Claude sessions share this working tree.
- **Shared files:** `App.tsx`, `About.tsx`, `About.test.tsx`, `navConfig.ts`, `Navbar.test.tsx`, the chatbot files, `docs/DESIGN.md` and `THIRD_PARTY_NOTICES.md`.
  - Before editing one, run `ListAgents`, tell peers with `SendMessage`, re-read the file, and use exact-match edits.
  - Never touch `src/index.css`, `vitest.config.ts` or `src/test/`.
- **Tests:** run them from PowerShell in `C:\portfolio\portfolio` with `npx vitest run <paths>`. Bash's `c:\` path loads vitest twice.
- **Finishing a task:** its tests, `npx eslint <changed files>` and `npx tsc -b` must all be green. Don't commit; the user commits on request.
- **Styling:** reuse the `.chat-*` classes as they are:
  - `chat-terminal`
  - `chat-corner chat-corner--tl|tr|bl|br`
  - `chat-scanlines`
  - `chat-head`
  - `chat-caret`
  - `chat-status`, with `data-status="input"` (cyan) or `"processing"` (indigo, blinking)
  - `chat-key`

  Their `.light` variants already cover the light theme.
- **Motion:** use the core easing `[0.22, 1, 0.36, 1]`, and put new motion inside `<MotionConfig reducedMotion="user">`.
- **Section ids:** the homepage keeps the ids `hero`, `projects`, `about` and `contact` (`App.test.tsx` checks them).
- **`/resume`:** behaves exactly as now, with no rocket cursor.
- **Copy:** the spec fixes all copy. Use the strings quoted in this plan verbatim.

## Review Focus

1. **Direct visit or refresh on `/contact`, then "← Back to portfolio":** lands on the homepage's Contact block, not off-site and not at the top. Pinned in Task 8.
2. **Ctrl-, ⌘-, Shift- or middle-click on "Send me a message":** the browser does its default (a new tab or window), with no in-app switch. Pinned in Task 5.
3. **Enter keys:** a native submit (Enter in name or email) goes through the checks and the lock. A plain Enter in the message adds a new line. Ctrl+Enter or ⌘+Enter submits from any field. Pinned in Task 3.
4. **Leaving `/contact` while a send is in flight:** no error, no confetti from a detached keycap, and coming back shows an empty form. Pinned in Tasks 2, 3 and 8.
5. **A non-JSON error body** (for example Vercel's HTML 502 page): the fallback message shows, and the typed text is kept. Pinned in Tasks 2 and 3.

---

### Task 1: In-app router

**Files:**
- Create: `portfolio/src/hooks/useRoute.ts`
- Test: `portfolio/src/hooks/useRoute.test.ts`

**Interfaces:**
- Produces:
  - `useRoute(): string`
    - Returns `window.location.pathname`.
    - Re-renders after `navigate()` and after `popstate`. Uses `useSyncExternalStore`, with a module-level listener set plus one `popstate` listener.
  - `navigate(to: string): void`
    1. Saves the scroll position in the current entry: `history.replaceState({ ...history.state, scrollY: window.scrollY }, '')`.
    2. Inside `flushSync`, calls `history.pushState({ inApp: true }, '', to)` and notifies the listeners.
    3. Runs step 2 inside `document.startViewTransition(...)` when that function exists and `window.matchMedia?.('(prefers-reduced-motion: reduce)').matches` is not true.
  - `goBackOr(fallback: string): void`
    - Calls `history.back()` when `history.state?.inApp === true`.
    - Otherwise calls `navigate(fallback)`.
  - `savedScrollY(): number | null`
    - Returns `history.state?.scrollY` when it's a number, otherwise `null`.

- [ ] **Step 1: Write the failing tests**

```ts
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { goBackOr, navigate, savedScrollY, useRoute } from './useRoute'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  Reflect.deleteProperty(document, 'startViewTransition')
  Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  history.replaceState(null, '', '/')
})

describe('useRoute', () => {
  it('re-renders with the new path after navigate', () => {
    const { result } = renderHook(() => useRoute())
    expect(result.current).toBe('/')
    act(() => navigate('/contact'))
    expect(result.current).toBe('/contact')
    expect(window.location.pathname).toBe('/contact')
  })

  it('follows Back and Forward', () => {
    const { result } = renderHook(() => useRoute())
    act(() => {
      history.pushState(null, '', '/contact')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current).toBe('/contact')
  })

  it('saves the scroll position of the page it leaves', () => {
    Object.defineProperty(window, 'scrollY', { value: 1234, configurable: true })
    const replace = vi.spyOn(history, 'replaceState')
    navigate('/contact')
    expect(replace).toHaveBeenCalledWith(expect.objectContaining({ scrollY: 1234 }), '')
  })

  it('reads a saved scroll position back', () => {
    history.replaceState({ scrollY: 560 }, '', '/')
    expect(savedScrollY()).toBe(560)
    history.replaceState(null, '', '/')
    expect(savedScrollY()).toBeNull()
  })

  it('goes back in history when the page was opened in-app', () => {
    const back = vi.spyOn(history, 'back').mockImplementation(() => {})
    navigate('/contact')
    goBackOr('/#contact')
    expect(back).toHaveBeenCalledTimes(1)
  })

  it('navigates to the fallback after a direct visit', () => {
    history.replaceState(null, '', '/contact')
    const back = vi.spyOn(history, 'back')
    goBackOr('/#contact')
    expect(back).not.toHaveBeenCalled()
    expect(window.location.pathname + window.location.hash).toBe('/#contact')
  })

  it('switches inside a view transition when motion is allowed', () => {
    const start = vi.fn((update: () => void) => {
      update()
      return { finished: Promise.resolve() }
    })
    Object.assign(document, { startViewTransition: start })
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })))
    navigate('/contact')
    expect(start).toHaveBeenCalledTimes(1)
    expect(window.location.pathname).toBe('/contact')
  })

  it('skips the view transition under reduced motion', () => {
    const start = vi.fn()
    Object.assign(document, { startViewTransition: start })
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })))
    navigate('/contact')
    expect(start).not.toHaveBeenCalled()
    expect(window.location.pathname).toBe('/contact')
  })
})
```

- [ ] **Step 2: Run the tests and see them fail**

Run: `npx vitest run src/hooks/useRoute.test.ts`
Expected: FAIL, because `./useRoute` doesn't exist yet.

- [ ] **Step 3: Implement `useRoute`, `navigate`, `goBackOr` and `savedScrollY` in `src/hooks/useRoute.ts`** as specified under Interfaces.

- [ ] **Step 4: Run the tests and see them pass**

Run: `npx vitest run src/hooks/useRoute.test.ts`
Expected: 8 passed.

- [ ] **Step 5: Lint and type-check**

Run: `npx eslint src/hooks/useRoute.ts src/hooks/useRoute.test.ts; npx tsc -b`
Expected: no output, exit code 0.

---

### Task 2: Send hook

**Files:**
- Create: `portfolio/src/components/contact/useContactSubmit.ts`
- Test: `portfolio/src/components/contact/useContactSubmit.test.ts`

**Interfaces:**
- Consumes: `ContactFormData` from `./contactSchema` (it already exists).
- Produces:
  - `type SendState = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string }`
  - `const FALLBACK_ERROR = 'Something went wrong. Please try again in a moment.'`
  - `useContactSubmit(): { state: SendState; send: (data: ContactFormData, origin: HTMLElement | null) => Promise<void>; reset: () => void }`
  - **Where the logic comes from:** today's `ContactForm.tsx` (`onSubmit`, `readServerError`, `fireConfetti`).
  - **Request:** `send` POSTs JSON to `/api/contact`.
  - **Lock:** a ref lock ignores `send` while a send is in flight and after a success. An error releases it, and so does `reset()`, which also sets the state back to `idle`.
  - **Confetti:** fires only when `origin?.isConnected`, with `{ particleCount: 40, spread: 55, startVelocity: 22, gravity: 1.1, scalar: 0.7, ticks: 150, colors: ['#6366f1', '#818cf8', '#22d3ee'], disableForReducedMotion: true }`, and an origin at the centre-top of `origin.getBoundingClientRect()`.
  - **Unmount:** no state updates after unmount.

- [ ] **Step 1: Write the failing tests**

```ts
import { act, renderHook } from '@testing-library/react'
import confetti from 'canvas-confetti'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FALLBACK_ERROR, useContactSubmit } from './useContactSubmit'

vi.mock('canvas-confetti', () => ({ default: vi.fn() }))

const fetchMock = vi.fn<typeof fetch>()
const data = { name: 'Jane Smith', email: 'jane@company.com', message: 'I would love to chat about a role.' }
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  fetchMock.mockReset()
  vi.mocked(confetti).mockClear()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('useContactSubmit', () => {
  it('posts the message as JSON to /api/contact', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(data) }),
    )
    expect(result.current.state).toEqual({ kind: 'sent' })
  })

  it('sends once while a send is in flight', async () => {
    let finish: (r: Response) => void = () => {}
    fetchMock.mockReturnValue(new Promise((resolve) => (finish = resolve)))
    const { result } = renderHook(() => useContactSubmit())
    act(() => {
      void result.current.send(data, null)
      void result.current.send(data, null)
    })
    expect(result.current.state).toEqual({ kind: 'sending' })
    await act(async () => finish(json(200, { success: true })))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('stays locked after a send', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    await act(() => result.current.send(data, null))
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("shows the server's error and unlocks", async () => {
    fetchMock.mockResolvedValue(json(429, { error: 'Too many requests. Please try again later.' }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    expect(result.current.state).toEqual({ kind: 'error', message: 'Too many requests. Please try again later.' })
    await act(() => result.current.send(data, null))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falls back when the error body is not JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    expect(result.current.state).toEqual({ kind: 'error', message: FALLBACK_ERROR })
  })

  it('falls back when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    expect(result.current.state).toEqual({ kind: 'error', message: FALLBACK_ERROR })
  })

  it('fires confetti from the origin, respecting reduced motion', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const origin = document.body.appendChild(document.createElement('button'))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, origin))
    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ disableForReducedMotion: true, colors: ['#6366f1', '#818cf8', '#22d3ee'] }),
    )
    origin.remove()
  })

  it('skips confetti when the origin has left the page', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, document.createElement('button')))
    expect(confetti).not.toHaveBeenCalled()
  })

  it('reset returns to idle and unlocks', async () => {
    fetchMock.mockResolvedValue(json(200, { success: true }))
    const { result } = renderHook(() => useContactSubmit())
    await act(() => result.current.send(data, null))
    act(() => result.current.reset())
    expect(result.current.state).toEqual({ kind: 'idle' })
    await act(() => result.current.send(data, null))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
```

- [ ] **Step 2: Run the tests and see them fail**

Run: `npx vitest run src/components/contact/useContactSubmit.test.ts`
Expected: FAIL, because the module doesn't exist yet.

- [ ] **Step 3: Implement `useContactSubmit` and `FALLBACK_ERROR` in `useContactSubmit.ts`**, using the logic in today's `ContactForm.tsx` as described under Interfaces.

- [ ] **Step 4: Run the tests and see them pass**

Run: `npx vitest run src/components/contact/useContactSubmit.test.ts`
Expected: 9 passed.

- [ ] **Step 5: Lint and type-check.** Run `npx eslint` on the two files, then `npx tsc -b`, and expect both to pass cleanly.

---

### Task 3: Terminal form

**Files:**
- Create: `portfolio/src/components/contact/PromptRow.tsx`, `portfolio/src/components/contact/TerminalForm.tsx`
- Test: `portfolio/src/components/contact/TerminalForm.test.tsx`

**Interfaces:**
- **Consumes:**
  - From Task 2: `useContactSubmit`, `SendState` and `FALLBACK_ERROR`.
  - From `./contactSchema` (it already exists): `contactSchema`, `CONTACT_LIMITS` and `ContactFormData`.
- **Produces:**
  - `PromptRow(props: PromptRowProps)`, where:

    ```ts
    PromptRowProps = {
      id: string; label: string; multiline?: boolean; type?: 'text' | 'email';
      autoComplete?: string; maxLength?: number; placeholder?: string; error?: string
    } & UseFormRegisterReturn
    ```

    - **Row:** a `<label>` holding the key text `{label}`, plus `<span aria-hidden="true"> ›</span>` in cyan, so the accessible name is exactly `label`. The field (a textarea with `rows={4}` when `multiline`) sits inside the label.
    - **Error:** the line `✗ {error}` with `id={`${id}-error`}` and `role="alert"`, in red mono. The field gets `aria-invalid` and, when there's an error, `aria-describedby`.
    - **Width:** the key sits beside the field from 401px up (`min-[401px]:flex-row`), and above it on narrower screens.
    - **Look:** the focused row gets a 2px cyan left bar and a cyan wash, and its key turns cyan, as in the mockup's `.t-row`. Rows are split by cyan hairlines.
  - `TerminalForm(props: { onBack: () => void })`.

**The form's markup:**
- **Frame:** `<form noValidate className="chat-terminal relative">`, holding the four `chat-corner`s and `chat-scanlines`.
- **Head row:** `<div className="chat-head">` showing `> new_message`, the `<span className="chat-caret" />`, and the status `<span className="chat-status" data-testid="terminal-status">`. The status text and `data-status`:
  - `ONLINE`, with no `data-status`, while idle with no focus
  - `INPUT`, with `data-status="input"`, while focus is inside the form
  - `SENDING`, with `data-status="processing"`, while a send is in flight
- **Comment line:** `// replies within 24 hours`.
- **Rows:**

  | id | label | type | autoComplete | maxLength | placeholder |
  |---|---|---|---|---|---|
  | `contact-name` | `name` | text | `name` | 100 | `Jane Smith` |
  | `contact-email` | `email` | `email` | `email` | 254 | `jane@company.com` |
  | `contact-message` | `message` | multiline | `off` | 2000 | `Tell me about the role or project…` |

- **Footer:**
  - The hint `CTRL + ⏎ TO SEND`, or `⌘ + ⏎ TO SEND` when `/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)`.
  - `<button type="submit" className="chat-key">`, which reads `⏎ Send message`. While sending it reads `SENDING…`, carries `aria-disabled="true"` and stays focusable.
- **Status for screen readers:** a visually hidden `<p role="status">` reading `Sending your message…` while sending, and empty otherwise.

**Behaviour:**
- **Ctrl or ⌘ + Enter:** an `onKeyDown` on the form calls `form.requestSubmit()`.
- **Native submit:** goes through react-hook-form with zod, then `send(data, keycapRef.current)`.
- **Errors:** a server or network error shows as `✗ {message}` with `role="alert"` above the footer.
- **Sent:** the rows and footer are replaced by `<div data-testid="terminal-sent" tabIndex={-1}>`, which takes focus. It holds:
  - the lines `> sending message… done`, `✓ delivered` (green) and `> I'll reply within 24 hours.`
  - the keycaps `↺ New message` (calls `reset()`, empties the form, focuses name) and `← Portfolio` (calls `onBack`)

- [ ] **Step 1: Write the failing tests** in `TerminalForm.test.tsx`

  Start the file the way today's `ContactForm.test.tsx` does:
  - `vi.mock('canvas-confetti', ...)`
  - `MotionGlobalConfig.skipAnimations = true` in `beforeAll`, set back to `false` in `afterAll`
  - a `fetchMock` stubbed with `vi.stubGlobal`

  Then add these helpers:

```ts
const fill = ({ name = 'Jane Smith', email = 'jane@company.com', message = 'I would love to chat about a role.' } = {}) => {
  fireEvent.change(screen.getByLabelText('name'), { target: { value: name } })
  fireEvent.change(screen.getByLabelText('email'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('message'), { target: { value: message } })
}
const keycap = () => screen.getByRole('button', { name: /send message|sending/i })
const status = () => screen.getByTestId('terminal-status')
```

  The tests:
  - `it('labels the three fields')`
    - `name` has `autocomplete="name"` and `maxLength` 100.
    - `email` has `type="email"` and `maxLength` 254.
    - `message` has `tagName` `TEXTAREA` and `maxLength` 2000.
  - `it('shows ONLINE, then INPUT while a field has focus, then SENDING')`
    - `status()` reads `ONLINE`.
    - After `fireEvent.focus(screen.getByLabelText('name'))`, it reads `INPUT` with `data-status="input"`.
    - With `fill()`, a pending fetch and a click on `keycap()`:
      - the status reads `SENDING` with `data-status="processing"`
      - `keycap()` has the text `SENDING…` and `aria-disabled="true"`
      - `getByRole('status')` has the text `Sending your message…`
  - `it('flags empty fields without sending')`
    - Click `keycap()`. `findAllByRole('alert')` returns the text contents `['✗ Name must be at least 2 characters', '✗ Please enter a valid email address', '✗ Message must be at least 10 characters']`.
    - `name` has `aria-invalid="true"`, and `fetchMock` wasn't called.
  - `it('sends with Ctrl+Enter or ⌘+Enter from the message')`
    - `fill()`, then `fireEvent.keyDown(screen.getByLabelText('message'), { key: 'Enter', ctrlKey: true })`. `waitFor` shows `fetchMock` called once.
    - Repeat in a fresh render with `metaKey: true`.
  - `it('keeps a plain Enter in the message as a new line')`
    - `fill()`, then `keyDown` Enter without modifiers, then `await act(async () => {})`. `fetchMock` wasn't called.
  - `it('sends a native submit once, through the checks')`
    - `fill()`. `fireEvent.submit` twice on `screen.getByLabelText('email').closest('form')`. `waitFor` shows `fetchMock` called once.
  - `it('shows a failed send as a ✗ line and keeps the text')`
    - Resolve with `new Response('<html>Bad gateway</html>', { status: 502 })`.
    - `findByText('✗ Something went wrong. Please try again in a moment.')` succeeds, and `email` still has the value `jane@company.com`.
  - `it('shows the delivered log, focused, with no promise of a confirmation email')`
    - After a 200, `findByTestId('terminal-sent')` has the texts `> sending message… done`, `✓ delivered` and `> I'll reply within 24 hours.`
    - It does not contain `/confirmation/i`, and it has focus (`waitFor`).
  - `it('starts an empty message after ↺ New message')`
    - After a send, click `↺ New message`. `name` has the value `''` and has focus.
  - `it('goes back from ← Portfolio')`: after a send, clicking `← Portfolio` calls `onBack` once.
  - `it('throws nothing when it leaves mid-send')`
    - Spy on `console.error`, start a pending send and `unmount()`.
    - Resolve the fetch inside `act`. `console.error` wasn't called.

- [ ] **Step 2: Run the tests and see them fail**

Run: `npx vitest run src/components/contact/TerminalForm.test.tsx`
Expected: FAIL, because `./TerminalForm` doesn't exist yet.

- [ ] **Step 3: Implement `PromptRow` and `TerminalForm`** as specified above. Use react-hook-form with `zodResolver(contactSchema)`, and its default `shouldFocusError`.

- [ ] **Step 4: Run the tests and see them pass**

Run: `npx vitest run src/components/contact/TerminalForm.test.tsx`
Expected: 11 passed.

- [ ] **Step 5: Lint and type-check the new files**, and expect both to pass cleanly.

---

### Task 4: The `/contact` page

**Files:**
- Create: `portfolio/src/components/contact/ContactPage.tsx`
- Test: `portfolio/src/components/contact/ContactPage.test.tsx`

**Interfaces:**
- **Consumes:**
  - `TerminalForm` (Task 3).
  - `ThemeToggle` from `../layout/ThemeToggle`, with props `{ theme: Theme; onToggle: (e: React.MouseEvent<HTMLButtonElement>) => void; className?: string }`.
  - `Theme` from `../../hooks/useTheme`.
- **Produces:** `ContactPage(props: { theme: Theme; onToggleTheme: (e: React.MouseEvent<HTMLButtonElement>) => void; onBack: () => void })`.

**Page markup:**
- **Wrapper:** `<div className="grid-bg relative flex min-h-svh flex-col bg-[#05070f] light:bg-[#f7f9fc]">`.
- **Top row:** `flex items-center gap-5 px-4 py-4 sm:px-8 sm:py-7`, which gives 16px padding on phones and about 28–32px on desktop.
  - The logo link `GC.`, with `href="/"` and `aria-label="GC, Genessis Contreras, back to portfolio"`.
  - A link reading `← Back to portfolio`, with `href="/#contact"`, styled as a bordered mono button.
  - `ThemeToggle`, pushed to the right.
  - A plain left click on either link calls `preventDefault()` and then `onBack()`. Clicks with modifier keys, or with a button other than the left one, are left to the browser.
- **Centred column:** `mx-auto w-full max-w-[590px] flex-1 content-center px-4 pb-16 sm:px-8`. The 16px gutters on phones let the terminal fill the width.
  - the eyebrow `// get.in.touch`
  - `<h1 tabIndex={-1}>Send me a message</h1>`, in Syne at about 34px
  - `<TerminalForm onBack={onBack} />`

**On mount:**
- Call `window.scrollTo({ top: 0, behavior: 'instant' })`.
- Focus the h1 with `{ preventScroll: true }`.
- Remember `document.title`, then set it to `Contact — Genessis Contreras`.
- On unmount, restore the remembered title.

- [ ] **Step 1: Write the failing tests**

  Stub `window.scrollTo` with `vi.fn()` in `beforeEach`. The tests:
  - `it('shows only the form page chrome')`
    - The heading level 1 named `Send me a message` is present.
    - The links matched by `/back to portfolio/i` and `/^GC, Genessis Contreras, back to portfolio$/` are present.
    - The button `Switch to light mode` is present.
    - `queryByRole('navigation', { name: 'Sections' })` is null.
  - `it('focuses the heading and names the tab')`: the h1 has focus, and `document.title` is `Contact — Genessis Contreras`.
  - `it('restores the previous title when it leaves')`: set `document.title = 'Home'` before rendering, then `unmount()`. The title is `Home` again.
  - `it('goes back from the logo and the back link')`
    - A plain click on each link calls `onBack` (two calls in total), and each event's `defaultPrevented` is true.
    - A `ctrlKey` click doesn't call it.
  - `it('switches the theme')`: clicking `Switch to light mode` calls `onToggleTheme` once.

- [ ] **Step 2: Run the tests and see them fail.** Run `npx vitest run src/components/contact/ContactPage.test.tsx`, and expect FAIL because the module doesn't exist yet.
- [ ] **Step 3: Implement `ContactPage`** as specified.
- [ ] **Step 4: Run the tests and see them pass.** Run the same command and expect 5 passed.
- [ ] **Step 5: Lint and type-check**, and expect both to pass cleanly.

---

### Task 5: Homepage Contact block

**Files:**
- Create:
  - `portfolio/src/components/contact/ExternalBioLink.tsx`
  - `portfolio/src/components/contact/HoloPortrait.tsx`
  - `portfolio/src/components/contact/contactIds.ts`
- Rewrite: `portfolio/src/components/sections/Contact.tsx`, `portfolio/src/components/sections/Contact.test.tsx`

**Interfaces:**
- **Consumes:**
  - `navigate` (Task 1).
  - `DecoderText` from `../motion/DecoderText`, with props `{ text; delayMs?; className? }`.
  - `SendIcon` from `../contact/ContactIcons`.
- **Produces:**
  - `CONTACT_OPEN_FORM_ID = 'contact-open-form'` in `contactIds.ts` (Task 8 uses it).
  - `ExternalBioLink({ href, children }: { href: string; children: ReactNode })`
    - Moved unchanged from `About.tsx`, together with its `bioLinkClass` constant.
    - It's an `<a target="_blank" rel="noopener noreferrer">` holding a `sr-only` ` (opens in a new tab)` note.
  - `HoloPortrait()`, with no props:
    - **Tag line:** a 64×3px indigo→cyan gradient bar, then `profile.webp`.
    - **Frame:** `chat-terminal relative mx-auto w-full max-w-[440px] lg:mx-0`, holding the four corners and `chat-scanlines`.
    - **Head row** (`chat-head`): `~ genessis/profile.webp`, then `<span className="chat-status">AVAILABLE</span>`.
    - **Body:** `relative h-[380px] overflow-hidden sm:h-[430px]`, with a faint cyan 28px grid masked to an ellipse and an indigo radial glow.
    - **Portrait:** `<img src={portrait640} srcSet={`${portrait640} 640w, ${portrait1100} 1100w`} sizes="(min-width: 1024px) 440px, 90vw" width={640} height={854} alt="Genessis Contreras" loading="lazy">`.
      - Import the two files from `../../assets/portrait-640.webp` and `../../assets/portrait.webp`.
      - Position: `absolute left-1/2 top-[6%] h-[118%] w-auto max-w-none -translate-x-1/2`. The bottom 18% of the photo, which holds the watermark, must never show.
    - **Foot row:** `GENESSIS S. CONTRERAS` on the left, `CAVITE · PH` on the right.
  - `Contact()` renders `<section id="contact" className="relative px-6 py-28 clear-side-nav bg-[#070b14] light:bg-white">`, with the top hairline About uses, then:
    - **Grid:** `mx-auto grid max-w-[1096px] gap-12 lg:grid-cols-[1fr_46%]`.
    - **Left column:**
      - the eyebrow `// get.in.touch`
      - `<h2>Hi there</h2>`, in Syne at about 38px. Show `<DecoderText text="Hi there" delayMs={300} />` once `useInView(ref, { once: true, margin: '-80px' })` is true, and the plain text before that.
      - the two bio paragraphs, copied verbatim from `About.tsx`'s bio, including the `ExternalBioLink`s to `https://www.hytel.io/` and `https://flinki.co/`
      - `<a id={CONTACT_OPEN_FORM_ID} href="/contact">` with `<SendIcon />` and the text `Send me a message`. A plain left click without modifiers calls `preventDefault()` and then `navigate('/contact')`.
    - **Right column:** `lg:pt-32`, holding `<HoloPortrait />`.
    - **Motion:** the columns fade up once on scroll, with the core easing. The portrait column follows 0.1s after the bio. Wrap the block in `<MotionConfig reducedMotion="user">`.

- [ ] **Step 1: Write the failing tests** in `Contact.test.tsx`

  Shared setup:
  - Reset with `afterEach(() => history.replaceState(null, '', '/'))`.
  - Add a `clickAndCheck(link, init)` helper. It registers a one-off `window` click listener that records `event.defaultPrevented` and then calls `preventDefault()`, so jsdom never navigates. It fires `fireEvent.click(link, init)` and returns the recorded value.

  The tests:
  - `it('greets with "Hi there" and the bio')`
    - A heading level 2 named `Hi there` is present.
    - The texts `/I'm Genessis, a full-stack developer based in Cavite, Philippines\./` and `/feel free to drop me a line\./` are present.
  - The two link tests, moved from `About.test.tsx`, with this exact name regex:

```ts
it.each([
  ['Hytel', 'https://www.hytel.io/'],
  ['Flinki', 'https://flinki.co/'],
])('links %s in the bio to its site in a new tab', (name, href) => {
  render(<Contact />)
  // jsdom drops the space before the screen-reader-only note; browsers keep it.
  const link = screen.getByRole('link', { name: new RegExp(`^${name} ?\\(opens in a new tab\\)$`) })
  expect(link).toHaveAttribute('href', href)
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
})
```

  - `it('opens the form page in-app on a plain click')`
    - The link `Send me a message` has `href="/contact"` and `id="contact-open-form"`.
    - `clickAndCheck(link, {})` returns true, and afterwards `window.location.pathname` is `/contact`.
  - `it.each([[{ ctrlKey: true }], [{ metaKey: true }], [{ shiftKey: true }], [{ button: 1 }]])('leaves %o clicks to the browser')`
    - `clickAndCheck` returns false, and `pathname` is still `/`.
  - `it('shows the photo in the holo frame')`
    - The img `Genessis Contreras` has `loading="lazy"`, a `srcset` containing `1100w`, `width="640"` and `height="854"`.
    - The texts `~ genessis/profile.webp`, `AVAILABLE`, `GENESSIS S. CONTRERAS` and `CAVITE · PH` are present.
  - `it('keeps the form off the homepage')`: `queryByRole('textbox')` is null.

- [ ] **Step 2: Run the tests and see them fail.** Run `npx vitest run src/components/sections/Contact.test.tsx`, and expect FAIL, because the old Hamish-style section still renders a form.
- [ ] **Step 3: Create `contactIds.ts`, `ExternalBioLink.tsx` and `HoloPortrait.tsx`, then rewrite `Contact.tsx`.** Don't remove `ExternalBioLink` from `About.tsx` yet; Task 6 does that.
- [ ] **Step 4: Run the tests and see them pass.** Run the same command and expect 9 passed (the `it.each` cases count separately).
- [ ] **Step 5: Lint and type-check.** Then run `npx vitest run src/App.test.tsx`, and expect it to pass, since the section ids are unchanged.

---

### Task 6: About without its top, and a three-link nav

**Files:**
- Modify:
  - `portfolio/src/components/sections/About.tsx`
  - `portfolio/src/components/layout/navConfig.ts`
  - `portfolio/src/components/layout/Navbar.test.tsx`
- Rewrite: `portfolio/src/components/sections/About.test.tsx`

**Interfaces:**
- **Produces:**
  - `NAV_LINKS = [{ label: 'Projects', href: '#projects' }, { label: 'Experience', href: '#experience' }, { label: 'Contact', href: '#contact' }]`.
  - `About()` still renders `section#about`, which now opens on the Experience header (`// career.log`).
  - `id="experience"` (with its `scroll-mt-20 desk:scroll-mt-0`) now sits on a wrapper around both the timeline and `<TechStack />`.

- [ ] **Step 1: Tell portfolio-18** that you're editing `About.tsx` and `About.test.tsx` now. Its link tests have already moved in Task 5. Then re-read both files.
- [ ] **Step 2: Write the failing tests**
  - **`About.test.tsx`**, replacing its contents:
    - `it('opens straight on Experience')`
      - `queryByText` returns null for `// about.sys`, `/Full-Stack Engineer/`, `~ genessis/profile.json`, `genesis060102@gmail.com` and `/I'm Genessis/`.
      - A heading level 2 named `Experience` is present.
    - `it('keeps the tech stack inside #experience')`: `within(document.getElementById('experience')!)` finds a heading named `What I Work With`.
  - **`Navbar.test.tsx`:**
    - Change `SECTIONS` to the three links.
    - In `links every section from the side rail`, add `expect(within(rail).queryByRole('link', { name: 'About' })).toBeNull()`.
    - In `marks the section crossing the middle…`, check that `Experience` is not current, where it checked About before.
    - Replace `prefers Experience over About while both cross the middle` with `it('keeps Experience current while #experience crosses the middle')`, using `intersection.byId = { about: true, experience: true }`.
    - In `follows the section in view rather than the last click`, use `intersection.byId = { experience: true }`, and expect `Experience` to be current.
- [ ] **Step 3: Run the tests and see them fail.** Run `npx vitest run src/components/sections/About.test.tsx src/components/layout/Navbar.test.tsx`, and expect FAIL.
- [ ] **Step 4: Edit `navConfig.ts` and `About.tsx`**
  - In `About.tsx`, remove the header `motion.div`, the bio-and-facts grid, `facts`, `bioLinkClass`, `ExternalBioLink` and the `ReactNode` import. Keep `fadeUp`, which Experience uses.
  - Move `id="experience"` onto a wrapper around the timeline and `<TechStack />`.
- [ ] **Step 5: Run the tests and see them pass.** Run the same command plus `src/App.test.tsx`, and expect all of them to pass.
- [ ] **Step 6: Lint and type-check**, and expect both to pass cleanly.

---

### Task 7: Chat orb pause flag

**Files:**
- Modify: `portfolio/src/components/Chatbot.tsx`, `portfolio/src/components/chat/ChatLauncher.tsx`
- Create: `portfolio/src/components/chat/ChatLauncher.test.tsx`

**Interfaces:**
- **Produces:**
  - `Chatbot(props: { pageHidden?: boolean })`, defaulting to `false`, passes `pageHidden` to `ChatLauncher`.
  - `ChatLauncherProps` gains `pageHidden?: boolean`, and the launcher renders `<ChatOrb theme={theme} paused={open || pageHidden} onReady={markOrbReady} />`.

- [ ] **Step 1: Tell your peers** you're editing `Chatbot.tsx` and `chat/ChatLauncher.tsx`. No session claims them.
- [ ] **Step 2: Write the failing test**

```ts
const orb = vi.hoisted(() => ({ props: [] as Array<{ paused: boolean }> }))
vi.mock('../three/ChatOrb', () => ({
  default: (props: { paused: boolean }) => {
    orb.props.push(props)
    return null
  },
}))

it.each([
  [false, false, false],
  [true, false, true],
  [false, true, true],
])('pauses the orb when open=%s and pageHidden=%s', async (open, pageHidden, paused) => {
  orb.props.length = 0
  render(<ChatLauncher open={open} pageHidden={pageHidden} controlsId="chat" theme="dark" onToggle={vi.fn()} />)
  await waitFor(() => expect(orb.props.at(-1)?.paused).toBe(paused))
})
```

- [ ] **Step 3: Run the test and see it fail.** Run `npx vitest run src/components/chat/ChatLauncher.test.tsx`, and expect FAIL: TypeScript rejects `pageHidden` in the test (run `npx tsc -b`), or the third case sees `paused` false.
- [ ] **Step 4: Add the prop to both components**, as specified.
- [ ] **Step 5: Run the tests and see them pass.** Run that file plus `src/components/Chatbot.test.tsx`, and expect all of them to pass.
- [ ] **Step 6: Lint and type-check**, and expect both to pass cleanly.

---

### Task 8: App routing

**Files:**
- Modify: `portfolio/src/App.tsx`, `portfolio/src/App.test.tsx`

**Interfaces:**
- **Consumes:**
  - `useRoute`, `goBackOr` and `savedScrollY` (Task 1)
  - `ContactPage` (Task 4)
  - `CONTACT_OPEN_FORM_ID` (Task 5)
  - `Chatbot`'s `pageHidden` prop (Task 7)
- **Behaviour of `App`:**
  - `path === '/resume'` returns `<Resume />`, unchanged.
  - Let `onContact = path === '/contact'`.
  - `const [homeMounted, setHomeMounted] = useState(!onContact)`. During render, `if (!onContact && !homeMounted) setHomeMounted(true)`, so a direct visit to `/contact` never loads the homepage until the visitor goes there.
  - **Render:**
    - When `homeMounted`, render `<div hidden={onContact} inert={onContact}>`. It wraps `Navbar`, the existing `<main>` (Hero, `Projects theme`, About, Contact), `Footer` and `<Chatbot pageHidden={onContact} />`.
    - Then `{onContact && <ContactPage theme={theme} onToggleTheme={toggleTheme} onBack={() => goBackOr('/#contact')} />}`.
    - Then `<RocketCursor theme={theme} />`.
  - **On path changes**, in a `useLayoutEffect` that tracks the previous path in a ref:
    - **Arriving at `/contact`:** set `history.scrollRestoration = 'manual'`.
    - **Leaving `/contact` for the homepage:**
      1. Set `history.scrollRestoration = 'auto'`.
      2. If `savedScrollY()` isn't null, scroll there with `window.scrollTo({ top: y, behavior: 'instant' })`. Otherwise call `document.getElementById('contact')?.scrollIntoView({ behavior: 'instant', block: 'start' })`.
      3. Call `document.getElementById(CONTACT_OPEN_FORM_ID)?.focus({ preventScroll: true })`.

- [ ] **Step 1: Tell portfolio-4e** that you're editing `App.tsx`. Its `<Projects theme={theme} />` line stays as it is. Then re-read `App.tsx`.
- [ ] **Step 2: Write the failing tests** in `App.test.tsx`
  - **Setup:**
    - Keep the existing mocks.
    - Add `vi.mock('./components/Chatbot', () => ({ Chatbot: (p: { pageHidden?: boolean }) => <div data-testid="chatbot" data-page-hidden={String(Boolean(p.pageHidden))} /> }))`.
    - In `beforeEach`, stub `window.scrollTo` and `Element.prototype.scrollIntoView` with `vi.fn()`.
    - Add `afterEach(() => history.replaceState(null, '', '/'))`.
    - Add a `clickAndCheck` helper like Task 5's, so jsdom never navigates.
  - **Tests:**
    - `it('opens /contact in-app and keeps the homepage underneath')`
      - Render, then click `Send me a message`.
      - The heading level 1 `Send me a message` is present, and `pathname` is `/contact`.
      - `document.querySelector('main')!.closest('[hidden]')` isn't null, and `document.getElementById('contact')` is still in the DOM.
      - `screen.getByTestId('chatbot')` has `data-page-hidden="true"`.
    - `it('returns to the Contact block on Back')`
      - Before clicking, set `window.scrollY` to 3200 with `Object.defineProperty`.
      - Open the page, then `await act(async () => { history.back() })`.
      - `waitFor` sees no level-1 heading. `window.scrollTo` was called with `{ top: 3200, behavior: 'instant' }`, and the link `Send me a message` has focus.
    - `it('renders only the form page on a direct visit, then goes home to the Contact block')`
      - `history.pushState(null, '', '/contact')`, then render. `document.querySelector('main')` is null.
      - Click `/back to portfolio/i`. Afterwards `pathname + hash` is `/#contact`, `main` exists, `scrollIntoView` was called, and the link `Send me a message` has focus.
    - `it('gives a fresh form after coming back')`
      - Open the page and type into `name`. Go back with `history.back()`, then open the page again.
      - `name` has the value `''`.
    - `it('keeps /resume as it is')`
      - `history.pushState(null, '', '/resume')`, then render.
      - `document.querySelector('main')` is null, and `document.documentElement` lacks the class `rocket-cursor`.
    - `it('flies the rocket cursor on the form page too')`: on a direct `/contact` visit, `document.documentElement` has the class `rocket-cursor`.
    - The existing three tests stay as they are.
- [ ] **Step 3: Run the tests and see them fail.** Run `npx vitest run src/App.test.tsx`, and expect FAIL.
- [ ] **Step 4: Rewrite `App`** as specified, with exact-match edits around the `<Projects theme={theme} />` line.
- [ ] **Step 5: Run the tests and see them pass.** Run the same command and expect all of them to pass.
- [ ] **Step 6: Lint and type-check, then run the whole suite.** Run `npx vitest run`, and expect every file to pass.

---

### Task 9: Remove the old form and update the docs

**Files:**
- Delete, all in `portfolio/src/components/contact/`:
  - `ContactForm.tsx` and `ContactForm.test.tsx`
  - `ContactField.tsx` and `ContactField.test.tsx`
  - `SendButton.tsx`
  - `NotchDivider.tsx`
  - `MessageSent.tsx`
  - `contactMotion.ts`
  - `contactStyles.ts`
- Modify:
  - `portfolio/src/components/contact/ContactIcons.tsx`: keep `SendIcon` and its Hamish credit line, and drop `ErrorIcon` and `ChevronRightIcon`.
  - `docs/DESIGN.md`
  - `portfolio/THIRD_PARTY_NOTICES.md`

- [ ] **Step 1: Confirm nothing imports the files being deleted**
  - Grep `src/` for `ContactForm|ContactField|SendButton|NotchDivider|MessageSent|contactMotion|contactStyles|ErrorIcon|ChevronRightIcon`.
  - Expected: hits only inside the files being deleted or edited.
- [ ] **Step 2: Delete the files and trim `ContactIcons.tsx`**
- [ ] **Step 3: Update the docs**, after telling your peers and re-reading each file.
  - **`DESIGN.md`:**
    - Replace the whole `### Contact (`src/components/contact/`)` entry, up to the line before `### Gradient Blobs (decorative)`, with a new entry. It covers:
      - the Contact block: layout, copy, the photo crop and why, and motion
      - the `/contact` page: chrome, terminal states, errors, the sent log (and that it promises no confirmation email), keyboard, focus and title
      - page switching: `useRoute`, the hidden homepage, the chat orb's `pageHidden` and the scroll and focus return
    - In the Navbar entry's **Links** bullet, add that they are "Projects, Experience and Contact".
  - **`THIRD_PARTY_NOTICES.md`:** replace the clause
    `` `src/components/contact/` (the "Say hello" contact form: its layout and timings, the notched divider, the floating-label fields, the cut-corner buttons and the send, error and chevron icons) ``
    with
    `` `src/components/sections/Contact.tsx` and `src/components/contact/` (the "Hi there" block's two-column layout, after his profile section, and his send icon) ``.
- [ ] **Step 4: Run the full checks**
  - Run: `npx vitest run; npx eslint .; npx tsc -b; npx vite build --outDir <scratchpad>/build-check --emptyOutDir`
  - Expected: every test file passes, and lint, type-check and build all succeed. The 500 kB chunk warning was already there.

---

### Task 10: Check it in a real browser

**Files:** none in the repo. Use a scratch CDP script in the session scratchpad, following the `headless-webgl-screenshots` and `cdp-visual-verification` memories.

- [ ] **Step 1: Start a private dev server** from `C:\portfolio\portfolio`, in the background: `npx vite --port 5199 --strictPort`.
- [ ] **Step 2: Screenshot the Contact block** in headless Edge (`--use-angle=d3d11 --enable-gpu`) at 1440×900, 1280×720 and 390×844, dark and light. Scroll to `#contact` with `scrollIntoView({ behavior: 'instant' })` first.
  - Expected: the bio on the left and the frame on the right on desktop, stacked on phones.
  - No pocket or watermark shows in the frame.
  - `scrollWidth - innerWidth` is 0 (the known 320px overflow is the only exception).
- [ ] **Step 3: Click "Send me a message"**
  - Expected: the URL is `/contact`, and the page shows only the logo, the back link, the theme toggle and the form.
  - `document.activeElement` is the h1, and the title is `Contact — Genessis Contreras`.
- [ ] **Step 4: Stub `fetch` in the page and walk the form's states**
  - Expected: an empty submit gives three `✗` lines, a pending send shows `SENDING` and `SENDING…`, a 429 shows a `✗` line, and a 200 shows the delivered log.
  - Screenshot each state in dark and in light.
- [ ] **Step 5: Check the WebGL goes quiet**
  - While `/contact` shows, count calls through the `drawArrays` and `drawElements` methods on `WebGL2RenderingContext.prototype` for 2 seconds.
  - Expected: 0 draws. Back on `/`, draws resume.
- [ ] **Step 6: Run `history.back()`**
  - Expected: the URL is `/`, `scrollY` is within 2px of where the page left off, and focus is on "Send me a message".
- [ ] **Step 7: Load `/contact` directly, then click "← Back to portfolio"**
  - Expected: the homepage opens at the Contact block.
- [ ] **Step 8: Fix anything this finds**, with a jsdom test where jsdom can express it, and re-run `npx vitest run`.

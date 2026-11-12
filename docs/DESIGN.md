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

### Scroll Indicator
```tsx
animate={{ y: [0, 10, 0] }}
transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
```

### Mobile Menu
```tsx
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto' }}
exit={{ opacity: 0, height: 0 }}
```

---

## Layout

- Max content width: `max-w-6xl` (navbar, sections), `max-w-4xl` (hero text)
- Section padding: `px-6 py-24` (desktop), `px-4` (mobile)
- Grid: 3-column cards (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`)
- Scroll behavior: `scroll-smooth` on `html`
- `min-h-screen` for hero section
- Don't combine `desk:` and `lg:` on the same property. Tailwind emits custom variants after the breakpoint variants, so `desk:` always wins.

---

## Tone & Voice

- Heading labels: ALL CAPS, letter-spaced monospace
- Copy: direct, technical, confident ("I build…", "combining clean frontend engineering with…")
- No buzzword overload; specificity preferred ("RAG pipelines, LLM integrations" over "AI solutions")
- Punctuation in brand logo: `GC.` — the period is accented cyan with glow

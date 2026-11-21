# Projects showcase backdrops: design

Date: 2026-11-15. Status: approved by the user through live previews ("i liked these, apply").

## Intent

Each project in the pinned Projects showcase gets its own animated background scene that hints at what the project is about. The scene changes as you scroll from one project to the next. Today every project shares the same indigo rings (`StageBackground.tsx`). The rings stay, as the fallback under the new scenes.

## Decided with the user

The user chose these by playing with throwaway previews (`.superpowers/brainstorm/1842-1794467081/content/*.html`, gitignored):

- **Option C:** a new scene per project, rather than recolouring the rings or bending them into shapes.
- **Scenes:**

| Project | Scene |
|---|---|
| Flinki | Pose tracking: a runner, a cyclist and a jumper as keypoint skeletons in detection boxes, with confidence scores and stats |
| Commission Monitoring System | Ledger lines; a chart rising through tranches 1 to 5; receivable bars |
| unwnd.cafe | Steam rising from behind the devices over drifting warm light |
| Leads Management System | Street map; listing pins drop in one by one, some with prices, joined like a pipeline |
| Maneho.ai | A scan line reads faint document text and boxes plate, violation, fine and date |
| Flux | Monitor sweep: heartbeat and oxygen traces, a pulsing heart and BPM readout |
| CADpractice | Blueprint grid; a cube, a cylinder, a flange and a bracket draw themselves with dimensions; a CAD crosshair moves between them |
| Switchboard | Circuit traces route in from team tags, with light pulses running along them |
| Talent Management System | Hexagon grid; skill cells light up with level pips |
| Mythica | Constellations (Cassiopeia, Ursa Major, Lyra, Orion, Cygnus) draw themselves in over faint stars |
| Reviva | Green and pink aurora curtains above and below the devices |

- **Rules for every scene:**
  - Faint, in the project's own colours (taken from its screenshot).
  - Fading out around the devices the way the rings do now: solid to 15% of the distance to the farthest corner, gone by 65%.
  - A light-theme version.
  - A cross-fade between projects.
  - A still frame under reduced motion.

## Goals, non-goals, anti-goals

- **Goal:** the background tells each project's story without pulling attention from the devices and the text.
- **Non-goal:** no new WebGL context, since the devices already use three.js. No third-party code.
- **Anti-goal:** busy shapes behind the panel text, or a scroll that stutters.

## How it is built (builder's calls)

- **Painter (`backdropPainter.ts`):** draws one 2D canvas. The showcase stacks two canvases above the CSS rings and cross-fades them in 700 ms when the active project changes. The outgoing canvas freezes on its last frame.
- **Virtual stage:**
  - Scenes draw on a 1440 × 900 virtual stage with the devices centred at (1008, 450), as in the previews.
  - The painter maps that point to the centre of the measured device cell.
  - It scales so the virtual device box (780 units wide) matches the width the 3D framing gives the devices: the 4.6 × 3 composition, with its 8% margin, fitted into the cell.
- **Layouts:**
  - Stacked layout (below `lg`): the scene also fades out below the device cell, so the text under the devices stays clean.
  - `tiny` fit (devices hidden): no scene, so the rings show.
- **Cost:**
  - At most 30 frames a second and a device-pixel ratio of at most 1.5.
  - Parts that don't move are cached per size and theme.
  - The scene only animates while the showcase is on screen; browsers already pause animation frames in hidden tabs.
- **Reduced motion:** one still frame, with each scene in its finished state, redrawn only when the theme, size or project changes.
- **Theme:** passed down from `App` as a prop, like `Hero` and `RocketCursor`.
- **Config:** a frontend registry maps each project id to its scene and palette. A project without an entry keeps the rings.
- **Failure:** `DecorativeBoundary` wraps the backdrop. Without a 2D context the canvases stay hidden and the rings show.

## Files

- `portfolio/src/components/projects/backdrops/`:
  - `backdropTypes.ts` (types) and `sceneMath.ts` (seeded random, easing, loops).
  - `drawKit.ts` (colour, dots, text, glows).
  - `backdropLayout.ts` (virtual stage to canvas mapping).
  - `backdropPainter.ts` (loop, compositing, caching).
  - `projectBackdrops.ts` (project id to scene and palette).
  - `scenes/*.ts`, one file per scene, with `scenes/index.ts`.
  - `ProjectBackdrop.tsx`, plus tests next to each file.
- `ProjectShowcase.tsx` mounts `ProjectBackdrop` over `StageBackground` and passes the device cell ref, the active project id and the theme.
- `Projects.tsx` and `App.tsx` pass `theme` down.
- `framing.ts` exports its composition size and margin, so the mapping can't drift from the 3D framing.
- `docs/DESIGN.md`: the Projects Showcase "Background" bullet.

## Testing

- **Unit tests:** scene geometry, kinematics and helpers.
- **Smoke tests:** every scene drawn on a recording fake 2D context in both themes, with motion on and off.
- **Registry:** covers every featured project.
- **Painter:** tested with a fake animation-frame clock (pausing, still mode, caching, dispose).
- **Component:** jsdom tests.
- **Visual:** headless Edge screenshots at desktop and phone sizes, in both themes and with reduced motion, plus a frame-time check.

## Plan

1. Export the composition constants from `framing.ts`. Add types, `sceneMath`, `drawKit` and `backdropLayout`, with tests.
2. Build the painter with tests.
3. Port the 11 scenes from the previews into typed modules, with the scene smoke test and geometry tests.
4. Add the registry and its tests.
5. Add `ProjectBackdrop` and wire it into `ProjectShowcase`, `Projects` and `App`, with tests.
6. Run lint, type-check, tests with coverage and the build.
7. Screenshot in headless Edge and tune the element positions around the real devices.
8. Get a code review, fix what it finds, and update `DESIGN.md`.

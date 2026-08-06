# Aura — a redesigned Cycle Tracker frontend

A from-scratch, visually independent frontend for the same cycle-tracking backend as
`../frontend` (Vite/MUI) — built to explore a premium, custom-designed interface
(dark-first, glass, real WebGL, purposeful motion) rather than a component-library
default look. `../frontend` is untouched and still works; this is a second, separate
client pointed at the identical `/api/v1` contract.

## Design system — "Aurora"

A bioluminescent, celestial visual language: deep-space blacks, a teal → violet → rose
aurora glow, glass panels with light refraction. Tokens live in `src/app/globals.css`
under Tailwind v4's `@theme` block (colors, radii, motion easings, keyframes).

**Scope tiering** (stated deliberately, not an oversight): a handful of pages get the
full bespoke treatment — custom WebGL scene, GSAP scroll choreography — while the rest
share the same component library, glass surfaces, and motion language without a
per-page 3D centerpiece. True bespoke-3D-everywhere isn't achievable to a genuinely high
bar across nine pages in one pass without it reading as thin everywhere instead of
excellent somewhere.

- **Full treatment:** landing page (`/`), auth (`/login`, `/register`), dashboard
  (`/dashboard` — the orbital cycle ring)
- **Shared system, no bespoke 3D:** `/calendar`, `/log`, `/trends`, `/settings`

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict), Tailwind CSS v4,
React Three Fiber + drei (the aurora shader scene, floating glass orbs, mouse
parallax), GSAP + ScrollTrigger (landing-page scroll reveals only), Motion
(component/page transitions, the 3D tilt-on-hover interaction), Lenis (smooth scroll,
scoped to the marketing route group), `cmdk` (⌘K command palette), Radix primitives
where they buy real accessibility (Dialog, Select, Tabs, Tooltip, Toast, Slider) — never
for visual scaffolding. Recharts for the trend charts, restyled to match.

## The orbital cycle ring

The dashboard's centerpiece (`src/components/dashboard/OrbitalCycleRing.tsx`) is an
original visualization instead of the flat stat-card grid every tracker defaults to: an
SVG ring split into menstrual/follicular/fertile/luteal arcs sized from your actual
predicted cycle length, with a glowing marker at today's position. The angle math is a
pure, unit-tested module (`src/lib/cycle/ring.ts`,
`src/lib/cycle/ring.test.ts`) — no DOM, no React — so the geometry is verified
independently of how it's drawn.

## Backend integration

Wired to the real FastAPI backend (`../backend`), not mock data. `src/lib/api/*` and
`src/types/api.ts` port `../frontend/src/api/*` and `../frontend/src/types/api.ts`
essentially as-is (same silent-refresh axios interceptor, same endpoint shapes), adjusted
for Next's `NEXT_PUBLIC_*` env var convention. Auth stays client-side (localStorage
tokens) since the backend's JWT scheme is unchanged — see `src/lib/auth/RouteGuard.tsx`
for the App Router-appropriate adaptation of the old app's `ProtectedRoute`.

## Running it

```bash
npm install
cp .env.example .env.local   # points at http://localhost:8000/api/v1 by default
npm run dev
```

Needs the backend running (`cd ../backend && source .venv/bin/activate && uvicorn
app.main:app --reload`) for anything past the login/register screens.

## Testing

```bash
npm run test    # Vitest — ring geometry, phase-by-date, symptom aggregation, auth flow
npm run lint     # ESLint, including the React Compiler-aligned hooks rules
npm run build    # Next build — includes a full TypeScript check
```

25 tests: the cycle-math modules (`phase.ts`, `ring.ts`, `aggregateBySymptom.ts`) are
pure and unit-tested the same way the backend's prediction algorithm is; Login/Register/
RouteGuard have component tests with the API layer mocked. Not exhaustive per-page
coverage — matches the rigor already established in `../frontend`, not beyond it.

## A deliberate lint fight worth knowing about

`src/components/three/AuroraPlane.tsx` has a scoped `eslint-disable` for
`react-hooks/refs`. This project's ESLint config includes newer React Compiler-aligned
rules that assume pure-render semantics; React Three Fiber's material lifecycle is
inherently imperative (mutating shader uniforms every frame, reading a ref-held material
instance in JSX to attach it to the scene graph) and doesn't fit that model. Every
non-trivial R3F codebase hits this — it's suppressed deliberately with a comment
explaining why, not silenced blindly.

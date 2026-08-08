# Aura — Cycle Tracker (Next.js)

A from-scratch, visually independent frontend for the same cycle-tracking backend as
`../frontend` — dark-first, glassy, with real WebGL and motion instead of a
component-library default look. `../frontend` still works untouched; this is a second
client hitting the same `/api/v1` contract.

## Design system

Deep-space blacks, a teal → violet → rose aurora glow, glass panels with light
refraction. Tokens live in `src/app/globals.css` under Tailwind v4's `@theme` block.

Landing (`/`), auth (`/login`, `/register`), and the dashboard (`/dashboard`, with the
orbital cycle ring) get the full bespoke treatment — a custom WebGL scene and scroll
choreography. `/calendar`, `/log`, `/trends`, `/settings` share the same component
system and glass surfaces without a per-page 3D centerpiece.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, React Three
Fiber + drei (aurora shader scene, floating glass orbs), GSAP + ScrollTrigger (landing
page), Motion (transitions, hover tilt), Lenis (smooth scroll), cmdk (command palette),
Radix primitives for accessibility, Recharts for trend charts.

## The orbital cycle ring

The dashboard's centerpiece (`src/components/dashboard/OrbitalCycleRing.tsx`): an SVG
ring split into menstrual/follicular/fertile/luteal arcs sized from your predicted cycle
length, with a marker at today's position. The angle math is a pure module
(`src/lib/cycle/ring.ts`, tested in `ring.test.ts`) — no DOM or React involved.

## Backend

Wired to the real FastAPI backend (`../backend`), not mock data. `src/lib/api/*`
mirrors `../frontend/src/api/*` (same silent-refresh axios interceptor), adjusted for
Next's `NEXT_PUBLIC_*` env vars. Auth is client-side (localStorage tokens) — see
`src/lib/auth/RouteGuard.tsx`.

## Running it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Needs the backend running (`cd ../backend && source .venv/bin/activate && uvicorn
app.main:app --reload`) for anything past the login/register screens.

## Testing

```bash
npm run test    # ring geometry, phase-by-date, symptom aggregation, auth flow
npm run lint
npm run build
```

# Handoff

Status as of this session: the app works end-to-end (verified via a full manual API
walkthrough — register → login → log periods → cycles/predictions/dashboard →
CSV/PDF export — against a real running instance, plus 88 backend + 19 frontend
automated tests, all green). Not yet deployed anywhere live.

## What's done

All 7 build-order steps from the original plan are complete:

1. **Backend** — FastAPI, layered `routers/services/repositories`, JWT auth (access +
   hashed opaque refresh tokens), CRUD for all 5 log types, Alembic migrations incl. a
   seeded symptom lookup table.
2. **Prediction engine** — `cycle_service.py` + `prediction_service.py`, pure
   functions with no DB/HTTP dependency, thoroughly unit-tested (no history / single
   cycle / regular / irregular / outlier-skewed-average).
3. **Frontend** — React 19 + TS + Vite + MUI, auth pages, protected routing, per-type
   logging forms, a phase-color-coded calendar, dashboard, Recharts trend charts,
   CSV/PDF export, account deletion.
4. **Docker** — `backend/Dockerfile` (migrations run on container start via
   `docker-entrypoint.sh`), `frontend/Dockerfile` (nginx-served static build),
   `docker-compose.yml` wiring db/api/web.
5. **CI** — `.github/workflows/backend-ci.yml` and `frontend-ci.yml`, path-scoped so
   each only runs when its half of the repo changes.
6. **Deploy configs** — `render.yaml`, `fly.toml`, `frontend/vercel.json`,
   `frontend/netlify.toml`. Prepared, not executed — no accounts were created, nothing
   is live. See README's Deployment section for the actual steps.
7. **README** — architecture (mermaid diagrams), route map, quickstart (Docker and
   non-Docker), testing, deployment.

## What's NOT done (by design, not by omission)

- **No live deployment.** You explicitly chose "prepare configs only" during planning —
  I don't have accounts on Render/Fly/Vercel/Netlify and wasn't going to create them on
  your behalf. The configs are ready; deploying is a `fly deploy` / Render Blueprint
  import / Vercel project import away.
- **No screenshots/GIF in the README.** I don't have browser automation available this
  session (you chose to continue without the Chrome extension mid-session). The app was
  verified via the API directly and via automated tests, not by looking at rendered
  pages. Run `docker compose up` or the local dev instructions and capture these
  yourself — worth doing before this goes on a CV, since a portfolio README without a
  screenshot undersells a genuinely polished UI.
- **Git identity** wasn't configured — commits used your machine's autodetected
  name/email (`sumedha sedhain <sumedhasedhain@sumedhas-MacBook-Pro.local>`). Fix with
  `git config --global user.name`/`user.email` if you want a different identity before
  pushing, or `git commit --amend --reset-author` on already-made commits.
- **No GitHub remote yet.** This is a local git repo only (`git init`, 5 commits on
  `main`). You'll need to create the GitHub repo and `git remote add origin ... && git
  push -u origin main` yourself — I didn't do this since it's your account.

## Two real bugs found and fixed during this session (worth knowing about)

Both were caught by testing more rigorously than "does it compile," not by inspection —
worth knowing if you extend this code, since the same classes of bug can recur:

1. **Symptom seed migration used the wrong enum representation.** SQLAlchemy's `Enum`
   type stores a Python enum's *member name* (`"PHYSICAL"`) by default, not its `.value`
   (`"physical"`). The seed migration inserted lowercase values directly via
   `op.bulk_insert`, bypassing the ORM's automatic conversion — this only broke on a real
   SQLite file (`/api/v1/symptoms` returned 500), not in the test suite, because the test
   fixtures seed via the ORM directly. Fixed in
   `backend/alembic/versions/e8c944a4129d_seed_symptoms.py`, and there's now a dedicated
   regression test (`backend/tests/integration/test_migrations.py`) that runs the real
   migration chain against a throwaway SQLite file and reads the data back through the
   ORM — so a future migration can't reintroduce this silently.
2. **`alembic/env.py` unconditionally overwrote the configured DB URL** from app
   settings, ignoring any URL a caller set beforehand. This is what made bug #1's
   regression test fail in a confusing way at first (migrations "succeeded" against the
   wrong database file). Fixed by only falling back to `settings.database_url` when the
   Alembic config doesn't already have one set.

Also worth knowing: the frontend's `determinePhase` util originally compared `Date`
objects that could carry a time-of-day component (e.g. `new Date()`) against date-only
boundaries computed from bare `date-fns` calls — this silently misclassified "today" near
midnight. Fixed by normalizing every comparison through `startOfDay()`; caught by that
util's own Vitest suite (`frontend/src/utils/phase.test.ts`), not by manual testing.

## Known trade-offs / things a stricter review would flag

- **Vite's production bundle is ~1MB (300KB gzipped)**, past Vite's default 500KB
  warning threshold — mostly MUI + Recharts. Not code-split. Fine for a portfolio demo,
  worth mentioning if asked about it in an interview: the fix is route-based
  `React.lazy()` splitting, deliberately skipped here to keep the frontend simple.
- **`npm audit` reports 2 high-severity transitive vulnerabilities** as of this session
  (not investigated in depth — didn't run `npm audit fix --force` since that can pull in
  breaking major-version bumps without review). Worth a look before treating this as
  production-ready.
- **Python 3.12 via Homebrew, not the system Python 3.9.6.** The system Python was too
  old for this code's syntax (`str | None`, `datetime.UTC`, etc.). I also tried Homebrew's
  Python 3.14 first — package installs stalled, likely missing prebuilt wheels for such a
  new interpreter — and switched to 3.12 instead. If you `python3 --version` and see 3.9,
  that's the system one; use `backend/.venv` (built against 3.12) for anything real.
- **This session's environment has no Docker installed**, so `docker compose up` was
  never actually run here — only `docker-compose.yml` and both `Dockerfile`s were
  syntax-checked (YAML/TOML parse) and reasoned through by hand. Worth running for real
  before relying on it.

## Suggested next steps, roughly in order

1. Run `docker compose up --build` yourself, click through the app, grab screenshots.
2. Push to GitHub, watch the two CI workflows go green on the actual PR/push trigger
   (they were never exercised against real GitHub Actions infra this session — only
   the same lint/test commands run locally).
3. Deploy for real (Render or Fly for the API, Vercel or Netlify for the frontend) and
   drop the live URL into the README.
4. Decide whether the ~1MB frontend bundle and the `npm audit` findings are worth fixing
   before calling this "done" for a CV.

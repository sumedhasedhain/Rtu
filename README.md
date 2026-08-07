# Cycle Tracker

A period and cycle tracker: log periods, symptoms, temperature, cervical mucus, and
ovulation tests, and it predicts your next period and fertile window from what you've
actually logged — not a generic 28-day guess.

## Stack

Backend is FastAPI (async) with SQLAlchemy 2.0 and Alembic for migrations — Postgres in
production, SQLite for local dev. Auth is JWT access tokens plus hashed, revocable
refresh tokens.

There are two frontends, both hitting the same API:

- `frontend` — React + Vite + MUI, the original build.
- `frontend-next` — Next.js + Tailwind, a redesigned version built later.

Both are tested (pytest / Vitest) and run in CI on every push.

## Layout

```
backend/         FastAPI app, Alembic migrations, tests
frontend/        React + Vite + MUI client
frontend-next/   Next.js client, alternate UI, same API
docker-compose.yml
render.yaml      backend deploy config for Render
```

## How predictions work

Period days get logged individually and grouped into cycles on the fly
(`cycle_service.py`) — cycles are never stored, so there's no derived table that can go
stale. From there (`prediction_service.py`, pure functions, no DB/HTTP, fully unit
tested):

- **Next period** = last start date + a recency-weighted average of your last few cycle
  lengths (recent cycles count more).
- **Fertile window** = predicted next period minus a ~14-day luteal estimate, with a few
  days' buffer either side.
- If your cycles are irregular or fall outside the usual 21–35 day range, it flags that
  instead of pretending to be confident.

## Running it locally

Easiest way — Docker spins up Postgres, the API, and the classic frontend together:

```bash
cp .env.example .env
docker compose up --build
```

API at http://localhost:8000/docs, frontend at http://localhost:5173.

Without Docker:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

```bash
cd frontend        # or frontend-next
npm install
cp .env.example .env    # frontend-next uses .env.local instead
npm run dev
```

`frontend-next` isn't wired into docker-compose, so run it this way even if the backend
is in Docker.

## API

Everything's under `/api/v1`, with Swagger docs at `/docs`.

- **Auth** — register, login, refresh, logout, password reset (currently just logs the
  reset token instead of emailing it — noted, not hidden)
- **Logging** — periods, symptoms, BBT, cervical mucus, ovulation tests
- **Predictions** — cycles, next-period, fertile-window, trend insights
- **Data** — CSV/PDF export, account deletion

## Testing

```bash
cd backend && pytest && ruff check app tests && black --check app tests
cd frontend && npm run test && npm run lint && npm run build
cd frontend-next && npm run test && npm run lint && npm run build
```

## Deploying it

- **Database** — [Neon](https://neon.com), free Postgres tier.
- **Backend** — Render, using `render.yaml`: import as a Blueprint, then set
  `DATABASE_URL` (your Neon connection string) and `CORS_ORIGINS` (your frontend URLs)
  yourself in the dashboard. They're deliberately left blank in the file rather than
  committed as placeholders.
- **Frontend** — Vercel, one project per client. Set the project's root directory to
  `frontend` or `frontend-next`, and point `VITE_API_BASE_URL` /
  `NEXT_PUBLIC_API_BASE_URL` at the backend's `/api/v1`.

## Rough edges, honestly

- `frontend`'s bundle is about 1MB (300KB gzipped) and isn't code-split — fine for now,
  worth revisiting by route if this grows.
- Password reset doesn't send real email yet, just logs the token server-side.
- Refresh tokens are random opaque strings, hashed at rest, not JWTs — that's what makes
  logout actually revoke them, since a JWT can't be revoked without a separate blocklist
  anyway.

# Frontend ↔ Backend Integration

This repo is a monorepo:

```
real-time-chat-app/
├── src/            # frontend (React 19 + Vite)  — consumes the live API
├── backend/        # backend  (Express + Prisma)
└── INTEGRATION.md  # you are here
```

## Status: fully wired to live data ✅

The frontend now consumes the backend over HTTP — the mock JSON layer has been
removed. Every screen renders data from PostgreSQL via TanStack Query, keeping
its loading, error and empty states.

How it fits together:

1. **Axios** (`src/services/axios.ts`) resolves its base URL from the Settings
   value (falling back to `VITE_API_BASE_URL`), attaches a JWT when present, and
   unwraps the `{ success, data }` envelope via `apiGet` / `apiPost`.
2. **Services** (`src/services/*.service.ts`) call the real endpoints and hand
   the raw response to the **mapper layer** (`src/services/mappers.ts`), which
   translates backend DTOs (`api.types.ts`) into the frontend domain types.
3. **CORS** on the backend allows the Vite dev origin (`localhost:5173`) and the
   dockerized frontend (`localhost:3000`).
4. The backend serves the router at both `/api` and `/api/v1`.

## Endpoint → screen mapping

| Endpoint             | Frontend usage                                   |
| -------------------- | ------------------------------------------------ |
| `GET /dashboard`     | Dashboard stats, pie/line/bar charts, activity   |
| `GET /collections`   | Collections grid (search, sort, paginate)        |
| `GET /collections/:id` | Collection detail                              |
| `GET /executions`    | `useExecutions` history hook                     |
| `GET /executions/:id`| `useExecutionRecord` detail hook                 |
| `GET /reports`       | Reports table                                    |
| `GET /reports/:id`   | Report detail (assertions, failures, charts)     |
| `GET /docker`        | Docker environment page                          |
| `GET /github`        | CI/CD pipeline page                              |

## Run both together

```bash
# Everything (db + backend + frontend) in one command:
docker compose up --build
# frontend → http://localhost:3000   backend → http://localhost:8080/api

# …or run them separately for development:
cd backend && npm run dev     # http://localhost:8080
npm run dev                   # http://localhost:5173
```

Verify the backend from the frontend origin:

```bash
curl http://localhost:8080/api/health
# → { "success": true, "data": { "status": "ok", ... } }
```

## Auth note

Read endpoints (dashboard, collections, executions, reports, docker, github)
are public so the dashboard works without a login screen. Write operations
(`POST/PUT/DELETE /collections`, `POST /executions/run`) require a JWT — log in
via `POST /api/auth/login` (seeded admin: `admin@rats.dev` / `Admin@12345`).

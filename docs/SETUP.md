# Developer Setup

Guide for getting a local environment running from a fresh clone.

## Prerequisites

| Tool           | Version           | Needed for                     |
| -------------- | ----------------- | ------------------------------ |
| Node.js        | 20+               | frontend, backend, Newman      |
| npm            | 9+                | package management             |
| Docker Desktop | latest            | one-command stack + CI parity  |
| PostgreSQL     | 16 (only if running the backend without Docker) |

## Option A — Everything in Docker (recommended)

```bash
git clone https://github.com/devtejasx/real-time-chat-app.git
cd real-time-chat-app
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend  → http://localhost:8080/api
- Swagger  → http://localhost:8080/api/docs
- Login    → `admin@rats.dev` / `Admin@12345`

Migrations and seeding run automatically on backend startup.

## Option B — Run locally for development

Install dependencies:

```bash
npm install                               # frontend (also installs Newman)
cd backend && npm install && npm run prisma:generate && cd ..
```

Configure env:

```bash
cp .env.example .env                      # frontend: VITE_API_BASE_URL
cp backend/.env.example backend/.env      # backend: DATABASE_URL, JWT_SECRET, …
```

Start a database (Docker is easiest even in this mode):

```bash
docker compose up -d db
```

Prepare and run the backend:

```bash
cd backend
npm run prisma:deploy       # apply migrations
npm run seed                # insert dummy data
npm run dev                 # http://localhost:8080
```

Run the frontend (new terminal):

```bash
npm run dev                 # http://localhost:5173
```

## Verifying it works

```bash
curl http://localhost:8080/api/health     # { "success": true, "data": { "status": "ok" } }
npm run test:api                          # 23 requests, 69 assertions, 0 failures
```

## Common tasks

| Task                          | Command                                  |
| ----------------------------- | ---------------------------------------- |
| Type-check frontend           | `npm run typecheck`                      |
| Build frontend                | `npm run build`                          |
| Type-check / build backend    | `cd backend && npm run build`            |
| Open Prisma Studio            | `cd backend && npm run prisma:studio`    |
| Reset DB (fresh seed)         | `docker compose down -v && docker compose up --build` |
| Run API tests                 | `npm run test:api`                       |

## Troubleshooting

- **Frontend shows an error state** → the backend isn't reachable at
  `VITE_API_BASE_URL`. Start the backend or update the URL in **Settings**.
- **`P1001` / DB connection errors** → Postgres isn't up or `DATABASE_URL` is
  wrong. `docker compose up -d db` and check the port.
- **Port already in use** → stop the process on 3000/8080/5432 or change the
  published ports in `docker-compose.yml`.

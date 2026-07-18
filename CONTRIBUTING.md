# Contributing

Thanks for your interest in improving the REST API Testing Suite. This guide
keeps changes consistent with the project's clean architecture.

## Getting started

See [docs/SETUP.md](docs/SETUP.md) for a full local setup. TL;DR:

```bash
docker compose up --build        # full stack
# or run frontend + backend separately for development
```

## Branch & commit conventions

- Branch from `main`: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Commit messages follow **Conventional Commits**:

  ```
  feat(frontend): add executions history page
  fix(backend): return 404 when collection is missing
  docs: expand testing strategy
  ```

## Architecture rules (please keep these)

- **Controllers stay thin** — parse the request, call one service, return the
  `{ success, data }` envelope. No business logic.
- **Business logic lives in services**; they throw typed `ApiError`s.
- **Only repositories touch Prisma / the database.**
- **Frontend**: components render, hooks fetch, services + mappers talk to the
  API. Don't call `axios` from a component.
- **TypeScript everywhere**; no `any` without a good reason.

## Before opening a PR

```bash
# frontend
npm run typecheck && npm run build

# backend
cd backend && npm run build && cd ..

# API tests (backend must be running)
docker compose up -d --build db backend
npm run test:api
```

All API assertions must pass and both apps must type-check and build.

## Adding an endpoint

1. Prisma model / migration (if needed) → repository → service → controller →
   route → Zod validator.
2. Document it in `backend/src/config/swagger.ts`.
3. Add a Postman request **with assertions** under the right folder.
4. If the UI consumes it, add an `api.types.ts` DTO + a `mappers.ts` mapper +
   a hook — keep the existing domain types.

## Reporting issues

Open an issue with steps to reproduce, expected vs actual behavior, and relevant
logs (`docker compose logs backend`).

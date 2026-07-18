# Folder Structure

```
real-time-chat-app/
├── src/                          # Frontend (React 19 + Vite)
│   ├── components/
│   │   ├── ui/                   # shadcn/ui primitives (button, card, table…)
│   │   ├── common/               # reusable app components (StatCard, DataTable…)
│   │   ├── charts/               # Recharts wrappers (PassFailPie, TrendChart…)
│   │   └── layout/               # Sidebar, TopNav
│   ├── pages/                    # one component per route
│   ├── layouts/                  # DashboardLayout shell
│   ├── hooks/                    # TanStack Query hooks (useDashboard, useExecutions…)
│   ├── services/                 # axios client + api.types + mappers + *.service
│   ├── routes/                   # router + path registry
│   ├── types/                    # frontend domain types
│   ├── utils/                    # formatters, constants, run simulator
│   └── lib/                      # cn() helper
│
├── backend/                      # Backend (Express + Prisma)
│   ├── src/
│   │   ├── config/               # env, logger, prisma client, swagger
│   │   ├── controllers/          # thin HTTP handlers
│   │   ├── services/             # business logic
│   │   ├── repositories/         # Prisma data access
│   │   ├── middleware/           # auth, validate, error, rate-limit, logger
│   │   ├── routes/               # express routers + root router
│   │   ├── validators/           # Zod schemas
│   │   ├── utils/                # ApiError, ApiResponse, jwt, password, id
│   │   ├── types/                # shared backend types
│   │   ├── prisma/               # PrismaClient singleton
│   │   ├── seed/                 # seed logic + compiled runner
│   │   ├── app.ts                # express app assembly
│   │   └── server.ts             # bootstrap + graceful shutdown
│   ├── prisma/
│   │   ├── schema.prisma         # datasource + models
│   │   ├── migrations/           # committed SQL migrations
│   │   └── seed.ts               # `prisma db seed` entry point
│   ├── Dockerfile
│   ├── docker-compose.yml        # standalone db + backend
│   └── docker-entrypoint.sh      # wait for db → migrate → seed → start
│
├── postman/                      # Postman collection + environment
├── reports/                      # Newman CLI/HTML/JUnit output (git-ignored)
├── docs/                         # architecture, testing, docker, ci/cd docs
├── .github/workflows/            # api-tests.yml (CI)
├── Dockerfile                    # frontend image (nginx)
├── docker-compose.yml            # root: db + backend + frontend (one command)
├── INTEGRATION.md                # how the two halves connect
└── README.md
```

## Conventions

- **One file per route** under `src/pages`, exported from `pages/index.ts`.
- **Services never render**; **components never fetch** — hooks bridge them.
- **Repositories are the only DB layer**; services never touch Prisma directly.
- **Path registry** (`src/routes/paths.ts`) is the single source of navigation truth.
- **Barrels** (`index.ts`) keep imports tidy per folder.

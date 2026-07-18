# Screenshots

Drop the following images here; the root `README.md` references them.

| File                    | What to capture                                             |
| ----------------------- | ---------------------------------------------------------- |
| `dashboard.png`         | The Dashboard with live stats, charts and recent activity  |
| `collections.png`       | Collections grid with search / sort / pagination           |
| `executions.png`        | Executions history table with status badges                |
| `report-detail.png`     | A report detail page (assertions + charts)                 |
| `newman.png`            | Newman CLI output or the generated HTML report             |
| `github-actions.png`    | A green Actions run of `API Tests`                         |
| `docker.png`            | `docker ps` showing the three running containers           |

## How to capture

```bash
# start the stack
docker compose up --build

# app pages
open http://localhost:3000          # dashboard, collections, executions, reports

# newman report
npm run test:api && open reports/newman-report.html

# docker containers
docker ps
```

Recommended: 1600×900, dark theme, PNG. Keep file sizes reasonable (< 500 KB).

# Testing Strategy

The suite is validated by an automated **Postman + Newman** API test suite that
runs both locally and in CI. It treats the backend as a black box and asserts on
real HTTP responses.

## What is tested

The collection (`postman/REST-API-Testing.postman_collection.json`) covers every
endpoint, grouped into folders: **Health, Authentication, Collections,
Executions, Reports, Dashboard, Docker, GitHub**.

Each request carries assertions covering:

| Category            | Example assertion                                            |
| ------------------- | ----------------------------------------------------------- |
| **Status codes**    | `pm.response.to.have.status(200)` / `201` / `401` / `404`   |
| **JSON schema**     | required fields present on the `data` object                |
| **Required fields** | e.g. collection has `id`, `name`, `totalRequests`, `passRate` |
| **Response time**   | `pm.expect(pm.response.responseTime).to.be.below(2000)`     |
| **Content-Type**    | header includes `application/json`                          |
| **Authentication**  | protected writes return `401` without a token, `201` with   |
| **Error responses** | `{ success:false }` with a non-empty `errors` array         |

## Chained flow

Requests run top-to-bottom and share state via collection variables:

1. **Authentication → Login** captures the JWT into `{{jwtToken}}`.
2. **Collections → List** captures a `{{collectionId}}`.
3. **Executions → Run** uses that id and captures an `{{executionId}}`.
4. **Reports → List** captures a `{{reportId}}` for the detail request.

Negative cases (invalid credentials, missing token, unknown id, invalid UUID)
assert the error envelope and status codes.

## Running the tests

The backend must be running (e.g. `docker compose up`), then:

```bash
npm run test:api        # CLI + HTML + JUnit reports → reports/
npm run test:api:cli    # CLI only (fast feedback)
```

Reports are written to:

- `reports/newman-report.html` — rich, shareable HTML (htmlextra)
- `reports/newman-report.xml` — JUnit XML for CI test summaries

## Latest run

```
Requests:            23
Assertions:          69
Failures:            0
Avg response time:   ~22ms
```

## Extending

- Add a request under the right folder, give it a `test` script with `pm.test`
  assertions, and reuse `{{baseUrl}}` / `{{jwtToken}}`.
- Keep negative-path coverage alongside happy-path for each new endpoint.

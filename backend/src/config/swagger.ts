import { env } from "./env";

/**
 * Hand-authored OpenAPI 3.0 document served at /api/docs. Kept as a single
 * source object (rather than scattered JSDoc) so the whole contract is easy to
 * read and version.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "REST API Testing Suite — API",
    version: "1.0.0",
    description:
      "Backend API that powers the REST API Testing Suite dashboard: collections, test executions, reports, dashboard metrics, and mocked Docker / GitHub Actions status.",
  },
  servers: [{ url: `http://localhost:${env.PORT}/api`, description: "Local" }],
  tags: [
    { name: "Auth" },
    { name: "Collections" },
    { name: "Executions" },
    { name: "Reports" },
    { name: "Dashboard" },
    { name: "Infrastructure" },
    { name: "Health" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Success: {
        type: "object",
        properties: { success: { type: "boolean", example: true }, data: {} },
      },
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string" },
          errors: { type: "array", items: { type: "object" } },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Tejas Nagmote" },
          email: { type: "string", example: "tejas@rats.dev" },
          password: { type: "string", example: "Secret@123" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "admin@rats.dev" },
          password: { type: "string", example: "Admin@12345" },
        },
      },
      CollectionInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Users API" },
          description: { type: "string", example: "CRUD for users" },
          totalRequests: { type: "integer", example: 24 },
          totalTests: { type: "integer", example: 68 },
        },
      },
      RunExecutionInput: {
        type: "object",
        required: ["collectionId"],
        properties: { collectionId: { type: "string", format: "uuid" } },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe",
        security: [],
        responses: { "200": { description: "OK" } },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": { description: "Account created" },
          "409": { description: "Email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": { description: "Authenticated" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current user's profile",
        responses: { "200": { description: "Profile" }, "401": { description: "Unauthorized" } },
      },
    },
    "/collections": {
      get: {
        tags: ["Collections"],
        summary: "List collections",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "Paginated collections" } },
      },
      post: {
        tags: ["Collections"],
        summary: "Create a collection",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CollectionInput" },
            },
          },
        },
        responses: { "201": { description: "Created" }, "400": { description: "Validation error" } },
      },
    },
    "/collections/{id}": {
      get: {
        tags: ["Collections"],
        summary: "Get a collection by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Collection" }, "404": { description: "Not found" } },
      },
      put: {
        tags: ["Collections"],
        summary: "Update a collection",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CollectionInput" } },
          },
        },
        responses: { "200": { description: "Updated" }, "404": { description: "Not found" } },
      },
      delete: {
        tags: ["Collections"],
        summary: "Delete a collection",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Deleted" }, "404": { description: "Not found" } },
      },
    },
    "/executions/run": {
      post: {
        tags: ["Executions"],
        summary: "Run a collection",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RunExecutionInput" } },
          },
        },
        responses: { "201": { description: "Execution completed" }, "404": { description: "Collection not found" } },
      },
    },
    "/executions": {
      get: {
        tags: ["Executions"],
        summary: "List executions",
        parameters: [
          { name: "collectionId", in: "query", schema: { type: "string", format: "uuid" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["RUNNING", "SUCCESS", "FAILED"] } },
        ],
        responses: { "200": { description: "Paginated executions" } },
      },
    },
    "/executions/{id}": {
      get: {
        tags: ["Executions"],
        summary: "Get an execution by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Execution" }, "404": { description: "Not found" } },
      },
    },
    "/reports": {
      get: {
        tags: ["Reports"],
        summary: "List reports",
        responses: { "200": { description: "Paginated reports" } },
      },
    },
    "/reports/{id}": {
      get: {
        tags: ["Reports"],
        summary: "Get a report by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
        responses: { "200": { description: "Report" }, "404": { description: "Not found" } },
      },
    },
    "/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Aggregated dashboard metrics",
        responses: { "200": { description: "Overview" } },
      },
    },
    "/docker": {
      get: {
        tags: ["Infrastructure"],
        summary: "Docker container status (mocked)",
        security: [],
        responses: { "200": { description: "Container list" } },
      },
    },
    "/github": {
      get: {
        tags: ["Infrastructure"],
        summary: "GitHub Actions workflow runs (mocked)",
        security: [],
        responses: { "200": { description: "Workflow runs" } },
      },
    },
  },
} as const;

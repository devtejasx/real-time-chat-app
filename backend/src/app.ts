import express, { type Application } from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { corsOrigins } from "./config/env";
import { openApiSpec } from "./config/swagger";
import { httpLogger, requestId, dbRequestLogger } from "./middleware/requestLogger";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import routes from "./routes";

/** Build and configure the Express application. */
export function createApp(): Application {
  const app = express();

  // Security headers.
  app.use(helmet());

  // CORS — allow the frontend dev server(s).
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  // Body parsing.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Observability.
  app.use(requestId);
  app.use(httpLogger);
  app.use(dbRequestLogger);

  // Rate limiting on the API surface.
  app.use("/api", apiLimiter);

  // API documentation.
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Mount the API under both /api and /api/v1 so the frontend's default base
  // URL (…/api/v1) also resolves without any frontend changes.
  app.use("/api", routes);
  app.use("/api/v1", routes);

  // Root banner.
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        name: "REST API Testing Suite API",
        docs: "/api/docs",
        health: "/api/health",
      },
    });
  });

  // 404 + centralized error handling (must be last).
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

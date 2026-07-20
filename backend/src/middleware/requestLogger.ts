import morgan from "morgan";
import type { Request, Response, NextFunction } from "express";
import { morganStream } from "../config/logger";
import { isProduction } from "../config/env";
import { generateId } from "../utils/id";
import { logService } from "../services/log.service";

/** Attach a unique correlation id to every request/response. */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers["x-request-id"] as string) || generateId();
  res.setHeader("x-request-id", id);
  (req as Request & { id: string }).id = id;
  next();
}

// Expose the request id as a Morgan token.
morgan.token("id", (req) => (req as Request & { id?: string }).id ?? "-");

const format = isProduction
  ? ':id :remote-addr :method :url :status :res[content-length] - :response-time ms'
  : ':id :method :url :status :response-time ms';

/** HTTP access logger that pipes through Winston. */
export const httpLogger = morgan(format, { stream: morganStream });

/**
 * Persist a REQUEST log row per response (Feature 12). Fire-and-forget; skips
 * noisy / self-referential endpoints to avoid recursion and log spam.
 */
export function dbRequestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const path = req.originalUrl.split("?")[0];
    if (path.includes("/logs") || path.endsWith("/health") || path.includes("/docs")) {
      return;
    }
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logService.record("REQUEST", `${req.method} ${path} → ${res.statusCode} (${ms}ms)`, level);
  });
  next();
}

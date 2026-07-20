import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";
import { logService } from "../services/log.service";
import { isProduction } from "../config/env";
import type { ErrorDetail, ErrorResponse } from "../types";

/**
 * Global error handler. Normalizes every thrown error — ApiError, ZodError,
 * Prisma errors, JWT errors and unexpected exceptions — into the standard
 * error envelope:
 *   { "success": false, "message": "...", "errors": [] }
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: ErrorDetail[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    ({ statusCode, message } = mapPrismaError(err));
  } else if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  ) {
    statusCode = 401;
    message = "Invalid or expired token";
  } else if (isBodyParserError(err)) {
    // Malformed JSON / oversized body from express.json — a client error.
    statusCode = err.status ?? err.statusCode ?? 400;
    message = statusCode === 413 ? "Request body too large" : "Malformed request body";
  } else if (err instanceof Error) {
    message = err.message || message;
  }

  // Log server-side faults with their stack; client faults at a lower level.
  if (statusCode >= 500) {
    logger.error(err instanceof Error ? err.stack || err.message : String(err));
    logService.record("ERROR", `${statusCode} ${err instanceof Error ? err.message : message}`, "error");
  } else {
    logger.warn(`${statusCode} ${message}`);
  }

  const body: ErrorResponse = { success: false, message, errors };

  // Never leak internals in production for unexpected 500s.
  if (statusCode >= 500 && isProduction) {
    body.message = "Internal server error";
  }

  res.status(statusCode).json(body);
}

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
} {
  switch (err.code) {
    case "P2002":
      return { statusCode: 409, message: "A record with this value already exists" };
    case "P2025":
      return { statusCode: 404, message: "Record not found" };
    case "P2003":
      return { statusCode: 400, message: "Related record does not exist" };
    default:
      return { statusCode: 400, message: "Database request error" };
  }
}

interface BodyParserError extends Error {
  type?: string;
  status?: number;
  statusCode?: number;
  body?: unknown;
}

/** Detect errors thrown by express.json() (malformed / oversized body). */
function isBodyParserError(err: unknown): err is BodyParserError {
  if (typeof err !== "object" || err === null) return false;
  const e = err as BodyParserError;
  const type = typeof e.type === "string" ? e.type : "";
  return (
    type.startsWith("entity.") ||
    type.startsWith("request.") ||
    type === "charset.unsupported" ||
    (err instanceof SyntaxError && "body" in e)
  );
}

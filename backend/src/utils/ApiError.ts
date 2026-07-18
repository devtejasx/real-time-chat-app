import type { ErrorDetail } from "../types";

/**
 * Operational error carrying an HTTP status code and optional field-level
 * details. Thrown from services/controllers and formatted by the global error
 * handler into the standard error envelope.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: ErrorDetail[];
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, errors: ErrorDetail[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", errors: ErrorDetail[] = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }

  static conflict(message = "Resource already exists") {
    return new ApiError(409, message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, message);
  }
}

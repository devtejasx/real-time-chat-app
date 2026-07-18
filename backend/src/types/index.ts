import type { Request } from "express";

/** Standard success envelope returned by every endpoint. */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/** Standard error envelope returned by the global error handler. */
export interface ErrorResponse {
  success: false;
  message: string;
  errors: ErrorDetail[];
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

/** JWT payload shape. */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}

/** An authenticated user attached to the request by the auth middleware. */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/** Express request extended with the authenticated user. */
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/** Generic paginated result. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

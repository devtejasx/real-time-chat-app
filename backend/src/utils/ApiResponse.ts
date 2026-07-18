import type { Response } from "express";
import type { SuccessResponse } from "../types";

/**
 * Helper for sending the standard success envelope:
 *   { "success": true, "data": ... }
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string,
): Response<SuccessResponse<T>> {
  const body: SuccessResponse<T> = { success: true, data };
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async route handler so any rejected promise is forwarded to the
 * Express error middleware instead of crashing the process. Lets controllers
 * use plain async/await without repetitive try/catch blocks.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

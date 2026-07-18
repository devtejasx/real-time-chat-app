import type { Request, Response } from "express";
import { dockerService } from "../services/docker.service";
import { githubService } from "../services/github.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

/** Infrastructure status endpoints (Docker + GitHub Actions). */
export const infraController = {
  docker: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, dockerService.getStatus());
  }),

  github: asyncHandler(async (_req: Request, res: Response) => {
    sendSuccess(res, githubService.getWorkflows());
  }),
};

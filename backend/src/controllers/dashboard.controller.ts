import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboardController = {
  overview: asyncHandler(async (_req: Request, res: Response) => {
    const overview = await dashboardService.getOverview();
    sendSuccess(res, overview);
  }),
};

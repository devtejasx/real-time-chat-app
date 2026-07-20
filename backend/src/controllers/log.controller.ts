import type { Request, Response } from "express";
import { logService } from "../services/log.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const logController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { type, level, page, pageSize } = req.query as unknown as {
      type?: string;
      level?: string;
      page: number;
      pageSize: number;
    };
    const result = await logService.list({ type, level, page, pageSize });
    sendSuccess(res, result);
  }),
};

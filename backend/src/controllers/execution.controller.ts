import type { Request, Response } from "express";
import type { ExecutionStatus } from "@prisma/client";
import { executionService } from "../services/execution.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const executionController = {
  run: asyncHandler(async (req: Request, res: Response) => {
    const execution = await executionService.run(req.body.collectionId);
    sendSuccess(res, execution, 201, "Execution completed");
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { collectionId, status, page, pageSize } = req.query as unknown as {
      collectionId?: string;
      status?: ExecutionStatus;
      page: number;
      pageSize: number;
    };
    const result = await executionService.list({ collectionId, status, page, pageSize });
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const execution = await executionService.getById(req.params.id);
    sendSuccess(res, execution);
  }),
};

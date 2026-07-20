import type { Request, Response } from "express";
import { reportService } from "../services/report.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const reportController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, pageSize } = req.query as unknown as {
      page: number;
      pageSize: number;
    };
    const result = await reportService.list({ page, pageSize });
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const report = await reportService.getById(req.params.id);
    sendSuccess(res, report);
  }),

  /** Serve the generated HTML report — inline to view, or as a download. */
  html: asyncHandler(async (req: Request, res: Response) => {
    const filePath = await reportService.getHtmlPath(req.params.id);
    if (req.query.download !== undefined) {
      res.download(filePath, `report-${req.params.id}.html`);
    } else {
      res.sendFile(filePath);
    }
  }),
};

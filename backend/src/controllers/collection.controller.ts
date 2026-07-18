import type { Request, Response } from "express";
import { collectionService } from "../services/collection.service";
import { sendSuccess } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const collectionController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { search, page, pageSize } = req.query as unknown as {
      search?: string;
      page: number;
      pageSize: number;
    };
    const result = await collectionService.list({ search, page, pageSize });
    sendSuccess(res, result);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const collection = await collectionService.getById(req.params.id);
    sendSuccess(res, collection);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const created = await collectionService.create(req.body);
    sendSuccess(res, created, 201, "Collection created");
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const updated = await collectionService.update(req.params.id, req.body);
    sendSuccess(res, updated, 200, "Collection updated");
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await collectionService.remove(req.params.id);
    sendSuccess(res, { id: req.params.id }, 200, "Collection deleted");
  }),
};

import {
  reportRepository,
  type ReportWithExecution,
} from "../repositories/report.repository";
import { ApiError } from "../utils/ApiError";
import type { Paginated } from "../types";

interface ListOptions {
  page: number;
  pageSize: number;
}

export const reportService = {
  async list({ page, pageSize }: ListOptions): Promise<Paginated<ReportWithExecution>> {
    const [items, total] = await Promise.all([
      reportRepository.findMany((page - 1) * pageSize, pageSize),
      reportRepository.count(),
    ]);
    return { items, total, page, pageSize };
  },

  async getById(id: string): Promise<ReportWithExecution> {
    const report = await reportRepository.findById(id);
    if (!report) throw ApiError.notFound("Report not found");
    return report;
  },
};

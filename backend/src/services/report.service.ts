import fs from "node:fs";
import path from "node:path";
import {
  reportRepository,
  type ReportWithExecution,
} from "../repositories/report.repository";
import { env } from "../config/env";
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

  /** Resolve the absolute path to a report's generated HTML file (Feature 6). */
  async getHtmlPath(id: string): Promise<string> {
    const report = await this.getById(id);
    if (!report.reportPath) {
      throw ApiError.notFound("No HTML report was generated for this execution");
    }
    // reportPath is stored as a basename; resolve safely within REPORTS_DIR.
    const abs = path.join(path.resolve(env.REPORTS_DIR), path.basename(report.reportPath));
    if (!fs.existsSync(abs)) {
      throw ApiError.notFound("Report file is no longer available on disk");
    }
    return abs;
  },
};

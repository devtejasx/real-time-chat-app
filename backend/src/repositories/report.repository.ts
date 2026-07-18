import type { Prisma, Report } from "@prisma/client";
import { prisma } from "../prisma/client";

const withExecution = {
  execution: { include: { collection: true, results: true } },
} satisfies Prisma.ReportInclude;

export type ReportWithExecution = Prisma.ReportGetPayload<{
  include: typeof withExecution;
}>;

/** Data-access for the Report model. */
export const reportRepository = {
  create(data: Prisma.ReportUncheckedCreateInput): Promise<Report> {
    return prisma.report.create({ data });
  },

  findMany(skip = 0, take = 50): Promise<ReportWithExecution[]> {
    return prisma.report.findMany({
      include: withExecution,
      orderBy: { execution: { startedAt: "desc" } },
      skip,
      take,
    });
  },

  count(): Promise<number> {
    return prisma.report.count();
  },

  findById(id: string): Promise<ReportWithExecution | null> {
    return prisma.report.findUnique({ where: { id }, include: withExecution });
  },

  /** Sum of passed/failed tests across all reports plus average latency. */
  async aggregateTotals(): Promise<{
    passed: number;
    failed: number;
    avgResponseTime: number;
  }> {
    const sums = await prisma.report.aggregate({
      _sum: { passed: true, failed: true },
      _avg: { averageResponseTime: true },
    });
    return {
      passed: sums._sum.passed ?? 0,
      failed: sums._sum.failed ?? 0,
      avgResponseTime: Math.round(sums._avg.averageResponseTime ?? 0),
    };
  },
};

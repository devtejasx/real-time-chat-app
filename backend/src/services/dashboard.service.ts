import { collectionRepository } from "../repositories/collection.repository";
import {
  executionRepository,
  type ExecutionWithGraph,
} from "../repositories/execution.repository";
import { reportRepository } from "../repositories/report.repository";
import { dockerService } from "./docker.service";
import { githubService } from "./github.service";

export interface PassFailDatum {
  name: "Passed" | "Failed" | "Skipped";
  value: number;
}

export interface ResponseTimePoint {
  timestamp: string;
  responseTime: number;
  p95: number;
}

export interface ExecutionTrendPoint {
  date: string;
  passed: number;
  failed: number;
}

export interface RecentActivityItem {
  id: string;
  collection: string;
  status: string;
  durationMs: number;
  startedAt: Date;
}

export interface DashboardOverview {
  totalApis: number;
  totalCollections: number;
  totalExecutions: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  averageResponseTime: number;
  passPercentage: number;
  failPercentage: number;
  dockerStatus: string;
  githubStatus: string;
  latestExecution: {
    id: string;
    collection: string;
    status: string;
    duration: number;
    startedAt: Date;
    finishedAt: Date | null;
  } | null;
  passFail: PassFailDatum[];
  responseTimes: ResponseTimePoint[];
  executionTrend: ExecutionTrendPoint[];
  recentActivity: RecentActivityItem[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Build a 7-day passed/failed trend from recent executions. */
function buildTrend(executions: ExecutionWithGraph[]): ExecutionTrendPoint[] {
  const buckets = new Map<string, ExecutionTrendPoint>();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = WEEKDAYS[d.getDay()];
    buckets.set(label, { date: label, passed: 0, failed: 0 });
  }
  for (const exec of executions) {
    const label = WEEKDAYS[new Date(exec.startedAt).getDay()];
    const bucket = buckets.get(label);
    if (bucket && exec.report) {
      bucket.passed += exec.report.passed;
      bucket.failed += exec.report.failed;
    }
  }
  return [...buckets.values()];
}

/** Build a response-time series from recent executions (oldest → newest). */
function buildResponseTimes(executions: ExecutionWithGraph[]): ResponseTimePoint[] {
  return [...executions]
    .filter((e) => e.report)
    .slice(0, 8)
    .reverse()
    .map((e) => {
      const avg = e.report?.averageResponseTime ?? 0;
      const label = new Date(e.startedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return { timestamp: label, responseTime: Math.round(avg), p95: Math.round(avg * 1.4) };
    });
}

export const dashboardService = {
  /** Aggregate high-level metrics + chart series for the dashboard overview. */
  async getOverview(): Promise<DashboardOverview> {
    const [totalApis, totalCollections, totalExecutions, totals, latest, recent] =
      await Promise.all([
        collectionRepository.sumRequests(),
        collectionRepository.count(),
        executionRepository.count(),
        reportRepository.aggregateTotals(),
        executionRepository.findLatest(),
        executionRepository.findMany({ skip: 0, take: 30 }),
      ]);

    const totalTests = totals.passed + totals.failed;
    const passPercentage =
      totalTests > 0 ? Math.round((totals.passed / totalTests) * 1000) / 10 : 0;
    const failPercentage =
      totalTests > 0 ? Math.round((totals.failed / totalTests) * 1000) / 10 : 0;

    const docker = dockerService.getStatus();
    const github = githubService.getWorkflows();

    return {
      totalApis,
      totalCollections,
      totalExecutions,
      totalTests,
      passedTests: totals.passed,
      failedTests: totals.failed,
      averageResponseTime: totals.avgResponseTime,
      passPercentage,
      failPercentage,
      dockerStatus: docker[0]?.health ?? "unknown",
      githubStatus: github[0]?.conclusion ?? "unknown",
      latestExecution: latest
        ? {
            id: latest.id,
            collection: latest.collection.name,
            status: latest.status,
            duration: latest.duration,
            startedAt: latest.startedAt,
            finishedAt: latest.finishedAt,
          }
        : null,
      passFail: [
        { name: "Passed", value: totals.passed },
        { name: "Failed", value: totals.failed },
        { name: "Skipped", value: 0 },
      ],
      responseTimes: buildResponseTimes(recent),
      executionTrend: buildTrend(recent),
      recentActivity: recent.slice(0, 6).map((e) => ({
        id: e.id,
        collection: e.collection.name,
        status: e.status,
        durationMs: e.duration,
        startedAt: e.startedAt,
      })),
    };
  },
};

import type { ExecutionStatus, Prisma } from "@prisma/client";
import {
  executionRepository,
  type ExecutionWithGraph,
} from "../repositories/execution.repository";
import { reportRepository } from "../repositories/report.repository";
import { collectionRepository } from "../repositories/collection.repository";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";
import type { Paginated } from "../types";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"] as const;
const ENDPOINTS = [
  "/auth/login",
  "/auth/refresh",
  "/users",
  "/users/:id",
  "/users/:id/todos",
  "/todos",
  "/todos/:id",
  "/products",
  "/orders",
  "/health",
];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface ListOptions {
  collectionId?: string;
  status?: ExecutionStatus;
  page: number;
  pageSize: number;
}

export const executionService = {
  /**
   * Run a collection. Because there is no live test-runner yet, this simulates
   * a Newman-style run: it generates per-request results, derives a report and
   * persists the whole graph. The shape matches what a real runner would emit,
   * so swapping in a live runner later is transparent to the API.
   */
  async run(collectionId: string): Promise<ExecutionWithGraph> {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) throw ApiError.notFound("Collection not found");

    const execution = await executionRepository.create(collectionId);

    const requestCount = Math.max(collection.totalRequests, 5);
    const results: Prisma.RequestResultCreateManyInput[] = [];
    let passed = 0;
    let failed = 0;
    let totalResponseTime = 0;

    for (let i = 0; i < requestCount; i += 1) {
      const method = METHODS[i % METHODS.length];
      const endpoint = ENDPOINTS[i % ENDPOINTS.length];
      const responseTime = randomBetween(45, 480);
      // ~90% success rate for a realistic pass distribution.
      const ok = Math.random() > 0.1;
      const statusCode = ok ? (method === "POST" ? 201 : 200) : randomBetween(400, 500);

      totalResponseTime += responseTime;
      if (ok) passed += 1;
      else failed += 1;

      results.push({
        executionId: execution.id,
        endpoint,
        method,
        statusCode,
        responseTime,
        passed: ok,
      });
    }

    await executionRepository.createResults(results);

    const totalTests = collection.totalTests || requestCount;
    const averageResponseTime = Math.round(totalResponseTime / requestCount);
    const status: ExecutionStatus = failed > 0 ? "FAILED" : "SUCCESS";
    // Duration approximates wall-clock: sum of latencies plus fixed overhead.
    const duration = totalResponseTime + randomBetween(200, 1200);

    await executionRepository.update(execution.id, {
      status,
      duration,
      finishedAt: new Date(),
    });

    await reportRepository.create({
      executionId: execution.id,
      totalTests,
      passed,
      failed,
      averageResponseTime,
    });

    logger.info(
      `Execution ${execution.id} for "${collection.name}" finished: ${status} (${passed}/${totalTests} passed)`,
    );

    const full = await executionRepository.findById(execution.id);
    if (!full) throw ApiError.internal("Execution disappeared after creation");
    return full;
  },

  async list({
    collectionId,
    status,
    page,
    pageSize,
  }: ListOptions): Promise<Paginated<ExecutionWithGraph>> {
    const [items, total] = await Promise.all([
      executionRepository.findMany({
        collectionId,
        status,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      executionRepository.count({ collectionId, status }),
    ]);
    return { items, total, page, pageSize };
  },

  async getById(id: string): Promise<ExecutionWithGraph> {
    const execution = await executionRepository.findById(id);
    if (!execution) throw ApiError.notFound("Execution not found");
    return execution;
  },
};

import path from "node:path";
import type { ExecutionStatus, Prisma } from "@prisma/client";
import {
  executionRepository,
  type ExecutionWithGraph,
} from "../repositories/execution.repository";
import { reportRepository } from "../repositories/report.repository";
import { collectionRepository } from "../repositories/collection.repository";
import { newmanService } from "./newman.service";
import { logService } from "./log.service";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";
import type { Paginated } from "../types";

interface ListOptions {
  collectionId?: string;
  status?: ExecutionStatus;
  page: number;
  pageSize: number;
}

export const executionService = {
  /**
   * Run a collection for real: creates a RUNNING execution, spawns Newman
   * against the target API, then persists the parsed results, the aggregate
   * report and the generated HTML report path. If Newman itself fails to run,
   * the execution is marked FAILED rather than left dangling.
   */
  async run(collectionId: string): Promise<ExecutionWithGraph> {
    const collection = await collectionRepository.findById(collectionId);
    if (!collection) throw ApiError.notFound("Collection not found");

    const execution = await executionRepository.create(collectionId);
    logService.record("EXECUTION", `Run started for "${collection.name}"`);

    try {
      const run = await newmanService.run({
        runId: execution.id,
        collectionName: collection.name,
      });

      const results: Prisma.RequestResultCreateManyInput[] = run.results.map((r) => ({
        executionId: execution.id,
        name: r.name,
        endpoint: r.endpoint,
        method: r.method,
        statusCode: r.statusCode,
        responseTime: r.responseTime,
        passed: r.passed,
        errorMessage: r.errorMessage,
      }));
      if (results.length) await executionRepository.createResults(results);

      const status: ExecutionStatus = run.status;
      await executionRepository.update(execution.id, {
        status,
        duration: run.durationMs,
        finishedAt: new Date(),
      });

      await reportRepository.create({
        executionId: execution.id,
        totalTests: run.totalTests,
        passed: run.passed,
        failed: run.failed,
        averageResponseTime: run.averageResponseTime,
        reportPath: path.basename(run.reportPath),
      });

      logger.info(
        `Execution ${execution.id} for "${collection.name}" finished: ${status} (${run.passed}/${run.totalTests} passed)`,
      );
      logService.record(
        "EXECUTION",
        `Run finished for "${collection.name}": ${status} (${run.passed}/${run.totalTests} passed)`,
        status === "FAILED" ? "warn" : "info",
      );

      const full = await executionRepository.findById(execution.id);
      if (!full) throw ApiError.internal("Execution disappeared after creation");
      return full;
    } catch (err) {
      // Never leave an execution stuck in RUNNING.
      await executionRepository.update(execution.id, {
        status: "FAILED",
        finishedAt: new Date(),
      });
      logger.error(
        `Execution ${execution.id} failed to run: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    }
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

  async remove(id: string): Promise<void> {
    await this.getById(id); // 404 if missing
    await executionRepository.delete(id);
  },
};

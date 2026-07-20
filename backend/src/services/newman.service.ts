import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiError } from "../utils/ApiError";

const requireCjs = createRequire(__filename);

export interface NewmanRequestResult {
  name: string;
  method: string;
  endpoint: string;
  statusCode: number;
  responseTime: number;
  passed: boolean;
  errorMessage: string | null;
}

export interface NewmanRunResult {
  status: "SUCCESS" | "FAILED";
  totalTests: number;
  passed: number;
  failed: number;
  averageResponseTime: number;
  durationMs: number;
  results: NewmanRequestResult[];
  reportPath: string; // path to the generated HTML report
}

interface RunOptions {
  runId: string;
  collectionName?: string;
}

/** Extract a readable endpoint from a Newman execution's request url. */
function endpointOf(request: unknown): string {
  const url = (request as { url?: unknown })?.url;
  if (typeof url === "string") return url;
  const u = url as { raw?: string; path?: string[] } | undefined;
  if (u?.raw) return u.raw;
  if (Array.isArray(u?.path)) return "/" + u.path.join("/");
  return "unknown";
}

/**
 * Newman runner. Spawns the Newman CLI (via node so it works cross-platform
 * and in the Docker image), runs the configured Postman collection against the
 * target API, and parses the JSON reporter output into a normalized result.
 * An HTML report (htmlextra) is written alongside for Feature 6.
 */
export const newmanService = {
  async run({ runId, collectionName }: RunOptions): Promise<NewmanRunResult> {
    const collection = path.resolve(env.POSTMAN_COLLECTION_PATH);
    const environment = path.resolve(env.POSTMAN_ENV_PATH);
    const reportsDir = path.resolve(env.REPORTS_DIR);

    if (!fs.existsSync(collection)) {
      throw ApiError.internal(`Postman collection not found at ${collection}`);
    }
    fs.mkdirSync(reportsDir, { recursive: true });

    const jsonPath = path.join(reportsDir, `run-${runId}.json`);
    const htmlPath = path.join(reportsDir, `run-${runId}.html`);

    // Resolve the Newman CLI entrypoint and run it with `node` for portability.
    const newmanCli = requireCjs.resolve("newman/bin/newman.js");
    const args = [
      newmanCli,
      "run",
      collection,
      "-e",
      environment,
      "--env-var",
      `baseUrl=${env.NEWMAN_TARGET_URL}`,
      "-r",
      "json,htmlextra",
      "--reporter-json-export",
      jsonPath,
      "--reporter-htmlextra-export",
      htmlPath,
      "--reporter-htmlextra-title",
      collectionName ?? "REST API Testing Suite",
    ];

    logger.info(`Newman run ${runId} starting → ${env.NEWMAN_TARGET_URL}`);

    const { code } = await new Promise<{ code: number | null }>((resolve, reject) => {
      const child = spawn(process.execPath, args, { windowsHide: true });
      let stderr = "";

      child.stdout.on("data", (chunk: Buffer) => {
        // Progress: forward Newman's live output to the logs.
        chunk
          .toString()
          .split("\n")
          .filter((l) => l.trim())
          .forEach((line) => logger.debug(`[newman:${runId}] ${line}`));
      });
      child.stderr.on("data", (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      child.on("error", (err) => reject(ApiError.internal(`Failed to spawn Newman: ${err.message}`)));
      child.on("close", (exitCode) => {
        // A non-zero exit means assertions failed — that is a valid result,
        // not an error. We only fail if Newman produced no parseable output.
        if (exitCode !== 0 && !fs.existsSync(jsonPath)) {
          reject(ApiError.internal(`Newman produced no report (exit ${exitCode}): ${stderr.slice(0, 500)}`));
          return;
        }
        resolve({ code: exitCode });
      });
    });

    if (!fs.existsSync(jsonPath)) {
      throw ApiError.internal("Newman JSON report was not generated");
    }

    const report = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as NewmanJsonReport;
    fs.rmSync(jsonPath, { force: true }); // keep only the HTML report

    const result = parseReport(report, htmlPath);
    logger.info(
      `Newman run ${runId} finished: ${result.status} (${result.passed}/${result.totalTests} passed, exit ${code})`,
    );
    return result;
  },
};

/* ----------------------------- report parsing ---------------------------- */

interface NewmanJsonReport {
  run: {
    stats: { assertions: { total: number; failed: number } };
    timings: { started: number; completed: number; responseAverage?: number };
    executions: {
      item: { name: string };
      request: unknown;
      response?: { code?: number; responseTime?: number };
      assertions?: { assertion: string; error?: { message: string } }[];
    }[];
  };
}

function parseReport(report: NewmanJsonReport, reportPath: string): NewmanRunResult {
  const { stats, timings, executions } = report.run;
  const totalTests = stats.assertions.total;
  const failed = stats.assertions.failed;
  const passed = Math.max(0, totalTests - failed);

  const results: NewmanRequestResult[] = executions.map((exec) => {
    const failedAssertion = exec.assertions?.find((a) => a.error);
    return {
      name: exec.item?.name ?? "request",
      method: (exec.request as { method?: string })?.method ?? "GET",
      endpoint: endpointOf(exec.request),
      statusCode: exec.response?.code ?? 0,
      responseTime: exec.response?.responseTime ?? 0,
      passed: !failedAssertion,
      errorMessage: failedAssertion?.error?.message ?? null,
    };
  });

  const measured = results.map((r) => r.responseTime).filter((n) => n > 0);
  const averageResponseTime = measured.length
    ? Math.round(measured.reduce((a, b) => a + b, 0) / measured.length)
    : Math.round(timings.responseAverage ?? 0);

  return {
    status: failed > 0 ? "FAILED" : "SUCCESS",
    totalTests,
    passed,
    failed,
    averageResponseTime,
    durationMs: Math.max(0, (timings.completed ?? 0) - (timings.started ?? 0)),
    results,
    reportPath,
  };
}

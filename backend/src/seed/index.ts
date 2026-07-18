import type { ExecutionStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";
import { hashPassword } from "../utils/password";
import { env } from "../config/env";
import { logger } from "../config/logger";

const COLLECTIONS = [
  { name: "Users API", description: "CRUD, profiles and role assignments.", totalRequests: 24, totalTests: 68 },
  { name: "Authentication", description: "Login, refresh tokens, password reset and MFA.", totalRequests: 16, totalTests: 52 },
  { name: "Todos API", description: "Task lists, items, labels and completion.", totalRequests: 18, totalTests: 44 },
  { name: "Payments API", description: "Checkout, refunds, webhooks and billing.", totalRequests: 31, totalTests: 89 },
  { name: "Products API", description: "Catalog, inventory, pricing and categories.", totalRequests: 27, totalTests: 71 },
];

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const ENDPOINTS = ["/users", "/users/:id", "/auth/login", "/todos", "/products", "/orders"];

const RESULTS_PER_EXECUTION = 5;
const EXECUTION_COUNT = 20;

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Remove existing data in FK-safe order. */
async function reset(): Promise<void> {
  await prisma.report.deleteMany();
  await prisma.requestResult.deleteMany();
  await prisma.execution.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Seed the database with realistic dummy data:
 *   1 admin user, 5 collections, 20 executions, 100 request results, 20 reports.
 */
export async function seedDatabase(): Promise<void> {
  logger.info("🌱 Seeding database…");
  await reset();

  // 1 admin user.
  const adminPassword = await hashPassword(env.SEED_ADMIN_PASSWORD);
  await prisma.user.create({
    data: {
      name: "Admin",
      email: env.SEED_ADMIN_EMAIL,
      password: adminPassword,
      role: "ADMIN",
    },
  });
  logger.info(`   • admin user: ${env.SEED_ADMIN_EMAIL}`);

  // 5 collections.
  const collections = await Promise.all(
    COLLECTIONS.map((c) => prisma.collection.create({ data: c })),
  );
  logger.info(`   • ${collections.length} collections`);

  let resultCount = 0;
  let reportCount = 0;

  // 20 executions, each with 5 request results and 1 report.
  for (let i = 0; i < EXECUTION_COUNT; i += 1) {
    const collection = collections[i % collections.length];
    const startedAt = new Date(Date.now() - i * 6 * 60 * 60 * 1000); // every 6h back

    const execution = await prisma.execution.create({
      data: { collectionId: collection.id, status: "RUNNING", startedAt },
    });

    const results: Prisma.RequestResultCreateManyInput[] = [];
    let passed = 0;
    let failed = 0;
    let totalResponseTime = 0;

    for (let r = 0; r < RESULTS_PER_EXECUTION; r += 1) {
      const method = METHODS[r % METHODS.length];
      const endpoint = ENDPOINTS[r % ENDPOINTS.length];
      const responseTime = randomBetween(45, 480);
      const ok = Math.random() > 0.12;
      const statusCode = ok ? (method === "POST" ? 201 : 200) : randomBetween(400, 500);

      totalResponseTime += responseTime;
      ok ? (passed += 1) : (failed += 1);
      results.push({ executionId: execution.id, endpoint, method, statusCode, responseTime, passed: ok });
    }

    await prisma.requestResult.createMany({ data: results });
    resultCount += results.length;

    const averageResponseTime = Math.round(totalResponseTime / RESULTS_PER_EXECUTION);
    const status: ExecutionStatus = failed > 0 ? "FAILED" : "SUCCESS";
    const duration = totalResponseTime + randomBetween(200, 1500);

    await prisma.execution.update({
      where: { id: execution.id },
      data: { status, duration, finishedAt: new Date(startedAt.getTime() + duration) },
    });

    await prisma.report.create({
      data: {
        executionId: execution.id,
        totalTests: collection.totalTests || RESULTS_PER_EXECUTION,
        passed,
        failed,
        averageResponseTime,
      },
    });
    reportCount += 1;
  }

  logger.info(`   • ${EXECUTION_COUNT} executions`);
  logger.info(`   • ${resultCount} request results`);
  logger.info(`   • ${reportCount} reports`);
  logger.info("✅ Seed complete");
}

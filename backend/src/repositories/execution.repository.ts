import type { Execution, ExecutionStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

interface FindManyOptions {
  collectionId?: string;
  status?: ExecutionStatus;
  skip?: number;
  take?: number;
}

/** Full execution graph including results, report and parent collection. */
const withGraph = {
  results: true,
  report: true,
  collection: true,
} satisfies Prisma.ExecutionInclude;

export type ExecutionWithGraph = Prisma.ExecutionGetPayload<{
  include: typeof withGraph;
}>;

/** Data-access for the Execution model and its children. */
export const executionRepository = {
  create(collectionId: string): Promise<Execution> {
    return prisma.execution.create({
      data: { collectionId, status: "RUNNING" },
    });
  },

  update(id: string, data: Prisma.ExecutionUpdateInput): Promise<Execution> {
    return prisma.execution.update({ where: { id }, data });
  },

  delete(id: string): Promise<Execution> {
    // Cascades to request_results and report (see schema onDelete: Cascade).
    return prisma.execution.delete({ where: { id } });
  },

  findById(id: string): Promise<ExecutionWithGraph | null> {
    return prisma.execution.findUnique({ where: { id }, include: withGraph });
  },

  findMany({
    collectionId,
    status,
    skip = 0,
    take = 50,
  }: FindManyOptions): Promise<ExecutionWithGraph[]> {
    return prisma.execution.findMany({
      where: { collectionId, status },
      include: withGraph,
      orderBy: { startedAt: "desc" },
      skip,
      take,
    });
  },

  count(where: Prisma.ExecutionWhereInput = {}): Promise<number> {
    return prisma.execution.count({ where });
  },

  findLatest(): Promise<ExecutionWithGraph | null> {
    return prisma.execution.findFirst({
      include: withGraph,
      orderBy: { startedAt: "desc" },
    });
  },

  /** Bulk-insert the per-request results for an execution. */
  createResults(
    results: Prisma.RequestResultCreateManyInput[],
  ): Promise<Prisma.BatchPayload> {
    return prisma.requestResult.createMany({ data: results });
  },
};

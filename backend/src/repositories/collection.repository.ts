import type { Collection, Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

interface FindManyOptions {
  search?: string;
  skip?: number;
  take?: number;
}

/** Include the latest execution (with its report) to derive live stats. */
const withLatest = {
  executions: {
    orderBy: { startedAt: "desc" },
    take: 1,
    include: { report: true },
  },
} satisfies Prisma.CollectionInclude;

export type CollectionWithLatest = Prisma.CollectionGetPayload<{
  include: typeof withLatest;
}>;

function searchWhere(search?: string): Prisma.CollectionWhereInput {
  return search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};
}

/** Data-access for the Collection model. */
export const collectionRepository = {
  findMany({ search, skip = 0, take = 50 }: FindManyOptions): Promise<Collection[]> {
    const where: Prisma.CollectionWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    return prisma.collection.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  },

  count(search?: string): Promise<number> {
    const where: Prisma.CollectionWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    return prisma.collection.count({ where });
  },

  findById(id: string): Promise<Collection | null> {
    return prisma.collection.findUnique({ where: { id } });
  },

  create(data: Prisma.CollectionCreateInput): Promise<Collection> {
    return prisma.collection.create({ data });
  },

  update(id: string, data: Prisma.CollectionUpdateInput): Promise<Collection> {
    return prisma.collection.update({ where: { id }, data });
  },

  delete(id: string): Promise<Collection> {
    return prisma.collection.delete({ where: { id } });
  },

  /** List collections including their most recent execution + report. */
  findManyWithStats({
    search,
    skip = 0,
    take = 50,
  }: FindManyOptions): Promise<CollectionWithLatest[]> {
    return prisma.collection.findMany({
      where: searchWhere(search),
      include: withLatest,
      skip,
      take,
      orderBy: { createdAt: "desc" },
    });
  },

  /** A single collection including its most recent execution + report. */
  findByIdWithStats(id: string): Promise<CollectionWithLatest | null> {
    return prisma.collection.findUnique({ where: { id }, include: withLatest });
  },

  /** Sum of `totalRequests` across all collections (used by the dashboard). */
  async sumRequests(): Promise<number> {
    const agg = await prisma.collection.aggregate({ _sum: { totalRequests: true } });
    return agg._sum.totalRequests ?? 0;
  },
};

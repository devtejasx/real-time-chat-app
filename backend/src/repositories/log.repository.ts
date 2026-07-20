import type { Log, Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

/** Data-access for application logs (Feature 12). */
export const logRepository = {
  create(data: Prisma.LogCreateInput): Promise<Log> {
    return prisma.log.create({ data });
  },

  findMany(where: Prisma.LogWhereInput, skip: number, take: number): Promise<Log[]> {
    return prisma.log.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  count(where: Prisma.LogWhereInput): Promise<number> {
    return prisma.log.count({ where });
  },
};

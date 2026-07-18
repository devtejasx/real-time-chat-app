import type { Collection } from "@prisma/client";
import {
  collectionRepository,
  type CollectionWithLatest,
} from "../repositories/collection.repository";
import { ApiError } from "../utils/ApiError";
import type { Paginated } from "../types";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
} from "../validators/collection.validator";

interface ListOptions {
  search?: string;
  page: number;
  pageSize: number;
}

/** Collection enriched with stats derived from its most recent execution. */
export interface EnrichedCollection extends Collection {
  status: "RUNNING" | "SUCCESS" | "FAILED" | null;
  lastRun: Date | null;
  passRate: number; // 0-100
}

/** Map a collection + its latest execution/report into the enriched DTO. */
function enrich(collection: CollectionWithLatest): EnrichedCollection {
  const latest = collection.executions[0];
  const report = latest?.report;
  const totalTests = report ? report.passed + report.failed : 0;
  const passRate =
    report && totalTests > 0
      ? Math.round((report.passed / totalTests) * 1000) / 10
      : 0;
  // Strip the relation array before returning the flat DTO.
  const { executions: _executions, ...base } = collection;
  return {
    ...base,
    status: latest?.status ?? null,
    lastRun: latest?.startedAt ?? null,
    passRate,
  };
}

export const collectionService = {
  async list({
    search,
    page,
    pageSize,
  }: ListOptions): Promise<Paginated<EnrichedCollection>> {
    const [items, total] = await Promise.all([
      collectionRepository.findManyWithStats({
        search,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      collectionRepository.count(search),
    ]);
    return { items: items.map(enrich), total, page, pageSize };
  },

  async getById(id: string): Promise<EnrichedCollection> {
    const collection = await collectionRepository.findByIdWithStats(id);
    if (!collection) throw ApiError.notFound("Collection not found");
    return enrich(collection);
  },

  create(input: CreateCollectionInput): Promise<Collection> {
    return collectionRepository.create({
      name: input.name,
      description: input.description,
      totalRequests: input.totalRequests,
      totalTests: input.totalTests,
    });
  },

  async update(id: string, input: UpdateCollectionInput): Promise<Collection> {
    await this.getById(id); // 404 if missing
    return collectionRepository.update(id, input);
  },

  async remove(id: string): Promise<void> {
    await this.getById(id); // 404 if missing
    await collectionRepository.delete(id);
  },
};

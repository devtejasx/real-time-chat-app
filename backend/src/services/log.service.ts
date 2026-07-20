import { logRepository } from "../repositories/log.repository";
import { logger } from "../config/logger";
import type { Paginated } from "../types";
import type { Log } from "@prisma/client";

export type LogLevel = "info" | "warn" | "error";
export type LogType = "REQUEST" | "AUTH" | "EXECUTION" | "ERROR" | "SYSTEM";

interface ListOptions {
  type?: string;
  level?: string;
  page: number;
  pageSize: number;
}

export const logService = {
  /**
   * Persist a log entry. Fire-and-forget: logging must never break the request
   * that triggered it, so failures are swallowed (and mirrored to Winston).
   */
  record(type: LogType, message: string, level: LogLevel = "info"): void {
    logRepository.create({ type, message, level }).catch((err) => {
      logger.debug(`Failed to persist log: ${err instanceof Error ? err.message : err}`);
    });
  },

  async list({ type, level, page, pageSize }: ListOptions): Promise<Paginated<Log>> {
    const where = {
      ...(type ? { type } : {}),
      ...(level ? { level } : {}),
    };
    const [items, total] = await Promise.all([
      logRepository.findMany(where, (page - 1) * pageSize, pageSize),
      logRepository.count(where),
    ]);
    return { items, total, page, pageSize };
  },
};

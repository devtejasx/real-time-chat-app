import { apiGet } from "./axios";
import type { ApiPaginated } from "./api.types";

export interface LogEntry {
  id: string;
  level: "info" | "warn" | "error" | string;
  type: "REQUEST" | "AUTH" | "EXECUTION" | "ERROR" | "SYSTEM" | string;
  message: string;
  createdAt: string;
}

/** Logs service (Feature 12) — reads the persisted log stream. */
export const logsService = {
  async list(params: { type?: string; level?: string } = {}): Promise<LogEntry[]> {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v && v !== "all"),
    );
    const page = await apiGet<ApiPaginated<LogEntry>>("/logs", {
      params: { pageSize: 100, ...cleaned },
    });
    return page.items;
  },
};

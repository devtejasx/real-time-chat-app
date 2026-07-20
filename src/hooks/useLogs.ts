import { useQuery } from "@tanstack/react-query";
import { logsService } from "@/services/logs.service";

/** Fetch persisted logs, optionally filtered by type/level. */
export function useLogs(filters: { type?: string; level?: string }) {
  return useQuery({
    queryKey: ["logs", filters],
    queryFn: () => logsService.list(filters),
  });
}

import { useQuery } from "@tanstack/react-query";
import { executionService } from "@/services";
import { queryKeys } from "./queryKeys";

/** List persisted execution history (GET /executions). */
export function useExecutions() {
  return useQuery({
    queryKey: queryKeys.executions,
    queryFn: executionService.list,
  });
}

/** Fetch a single persisted execution with its request results. */
export function useExecutionRecord(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.execution(id ?? "unknown"),
    queryFn: () => executionService.getById(id as string),
    enabled: Boolean(id),
  });
}

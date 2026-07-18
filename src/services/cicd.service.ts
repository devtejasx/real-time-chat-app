import { apiGet } from "./axios";
import { mapWorkflowRun } from "./mappers";
import type { ApiWorkflowRun } from "./api.types";
import type { WorkflowRun } from "@/types";

/** CI/CD service. GitHub Actions workflow runs from GET /github. */
export const cicdService = {
  async listWorkflowRuns(): Promise<WorkflowRun[]> {
    const runs = await apiGet<ApiWorkflowRun[]>("/github");
    return runs.map(mapWorkflowRun);
  },
};

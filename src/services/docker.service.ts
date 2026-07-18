import { apiGet } from "./axios";
import { mapDockerContainer } from "./mappers";
import type { ApiDockerContainer } from "./api.types";
import type { DockerContainer } from "@/types";

/** Docker service. Container health, resource usage and logs from GET /docker. */
export const dockerService = {
  async listContainers(): Promise<DockerContainer[]> {
    const containers = await apiGet<ApiDockerContainer[]>("/docker");
    return containers.map(mapDockerContainer);
  },

  /**
   * UI-only restart. The backend does not expose a real restart endpoint yet,
   * so this resolves after a short delay to drive the button's pending state.
   */
  restartContainer(id: string): Promise<{ id: string; restarted: boolean }> {
    return new Promise((resolve) =>
      setTimeout(() => resolve({ id, restarted: true }), 1200),
    );
  },
};

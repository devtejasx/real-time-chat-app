export interface DockerContainerStatus {
  id: string;
  name: string;
  image: string;
  status: "running" | "exited" | "restarting";
  state: "running" | "exited" | "restarting";
  health: "healthy" | "degraded" | "down";
  cpuUsage: number; // percentage
  memoryUsage: { usedMb: number; limitMb: number };
  ports: string[];
  uptime: string;
  logs: string[];
}

/**
 * Docker status service. Returns mocked container information today.
 *
 * TODO: replace with real Docker Engine integration via dockerode by talking
 * to /var/run/docker.sock, listing containers and reading `stats`.
 */
export const dockerService = {
  getStatus(): DockerContainerStatus[] {
    // A little jitter so repeated calls look "live".
    const jitter = (base: number, spread: number) =>
      Math.round((base + (Math.random() - 0.5) * spread) * 10) / 10;

    return [
      {
        id: "ctr_backend",
        name: "rats-backend",
        image: "rest-api-suite/backend:1.0.0",
        status: "running",
        state: "running",
        health: "healthy",
        cpuUsage: jitter(18, 6),
        memoryUsage: { usedMb: Math.round(jitter(312, 40)), limitMb: 1024 },
        ports: ["0.0.0.0:8080->8080/tcp"],
        uptime: "4h 12m",
        logs: [
          "[info] Server ready at http://localhost:8080",
          "[info] Connected to PostgreSQL",
          "[http] GET /api/dashboard 200 12ms",
          "[http] GET /api/collections 200 8ms",
          "[info] Execution finished: SUCCESS (5/5 passed)",
        ],
      },
      {
        id: "ctr_db",
        name: "rats-postgres",
        image: "postgres:16-alpine",
        status: "running",
        state: "running",
        health: "healthy",
        cpuUsage: jitter(6, 3),
        memoryUsage: { usedMb: Math.round(jitter(198, 20)), limitMb: 512 },
        ports: ["0.0.0.0:5432->5432/tcp"],
        uptime: "4h 13m",
        logs: [
          "[log] database system is ready to accept connections",
          "[log] checkpoint starting: time",
          "[log] checkpoint complete: wrote 42 buffers",
        ],
      },
    ];
  },
};

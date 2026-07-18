export interface DockerContainerStatus {
  id: string;
  name: string;
  image: string;
  status: "running" | "exited" | "restarting";
  health: "healthy" | "degraded" | "down";
  cpuUsage: number; // percentage
  memoryUsage: { usedMb: number; limitMb: number };
  ports: string[];
  uptime: string;
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
        name: "api-testing-backend",
        image: "rest-api-suite/backend:1.0.0",
        status: "running",
        health: "healthy",
        cpuUsage: jitter(18, 6),
        memoryUsage: { usedMb: Math.round(jitter(312, 40)), limitMb: 1024 },
        ports: ["0.0.0.0:8080->8080/tcp"],
        uptime: "4h 12m",
      },
      {
        id: "ctr_db",
        name: "api-testing-postgres",
        image: "postgres:16-alpine",
        status: "running",
        health: "healthy",
        cpuUsage: jitter(6, 3),
        memoryUsage: { usedMb: Math.round(jitter(198, 20)), limitMb: 512 },
        ports: ["0.0.0.0:5432->5432/tcp"],
        uptime: "4h 13m",
      },
    ];
  },
};

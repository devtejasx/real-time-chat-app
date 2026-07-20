import { motion } from "framer-motion";
import {
  Container,
  Cpu,
  Database,
  HardDrive,
  Loader2,
  MemoryStick,
  Network,
  RotateCcw,
  Terminal,
} from "lucide-react";
import {
  ChartSkeleton,
  ErrorState,
  PageHeader,
  ProgressIndicator,
  StatusBadge,
  useToast,
} from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useContainers, useRestartContainer } from "@/hooks";
import { cn } from "@/lib/utils";
import type { DockerContainer } from "@/types";

export function DockerPage() {
  const { data, isLoading, isError, refetch } = useContainers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Docker Environment"
        description="Container health, resource usage and logs for the test infrastructure."
      />

      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {data.map((container, i) => (
            <ContainerCard key={container.id} container={container} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function ContainerCard({
  container,
  index,
}: {
  container: DockerContainer;
  index: number;
}) {
  const restart = useRestartContainer();
  const { toast } = useToast();
  const isDb = container.image.includes("postgres");
  const isCache = container.image.includes("redis");
  const Icon = isDb ? Database : isCache ? HardDrive : Container;

  const memPct = (container.memoryUsedMb / container.memoryLimitMb) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm">{container.name}</CardTitle>
              <p className="font-mono text-[11px] text-muted-foreground">
                {container.image}
              </p>
            </div>
          </div>
          <StatusBadge status={container.status} variant="health" />
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          {/* Meta */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  container.state === "running" ? "bg-emerald-400" : "bg-slate-500",
                )}
              />
              {container.state}
            </span>
            <span className="text-muted-foreground">uptime {container.uptime}</span>
          </div>

          {/* Ports */}
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Network className="h-3.5 w-3.5" />
              Ports
            </p>
            <div className="flex flex-wrap gap-1.5">
              {container.ports.map((port) => (
                <Badge key={port} variant="secondary" className="font-mono text-[10px]">
                  {port}
                </Badge>
              ))}
            </div>
          </div>

          {/* Resource meters */}
          <div className="space-y-3">
            <ProgressIndicator
              value={container.cpuPct}
              label="CPU"
              indicatorClassName={container.cpuPct > 80 ? "bg-rose-500" : "bg-blue-500"}
            />
            <ProgressIndicator
              value={memPct}
              showValue={false}
              label="Memory"
              indicatorClassName={memPct > 80 ? "bg-rose-500" : "bg-emerald-500"}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" /> {container.cpuPct.toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <MemoryStick className="h-3 w-3" /> {container.memoryUsedMb} /{" "}
                {container.memoryLimitMb} MB
              </span>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              Container logs
            </p>
            <div className="h-36 overflow-y-auto rounded-lg bg-[#0a0e14] p-3 font-mono text-[11px] leading-relaxed text-slate-300">
              {container.logs.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          </div>

          {/* Restart (UI-only) */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={restart.isPending}
            onClick={() =>
              restart.mutate(container.id, {
                onSuccess: () =>
                  toast({
                    title: "Container restarted",
                    description: container.name,
                    variant: "success",
                  }),
                onError: () =>
                  toast({
                    title: "Restart failed",
                    description: container.name,
                    variant: "error",
                  }),
              })
            }
          >
            {restart.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
            {restart.isPending ? "Restarting…" : "Restart container"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

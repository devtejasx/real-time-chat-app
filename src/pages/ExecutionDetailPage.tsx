import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock, Hash, Timer, XCircle } from "lucide-react";
import {
  ChartSkeleton,
  ErrorState,
  MethodBadge,
  PageHeader,
  StatusBadge,
} from "@/components/common";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useExecutionRecord } from "@/hooks";
import { paths } from "@/routes/paths";
import { formatDateTime, formatDuration, formatMs } from "@/utils/format";

export function ExecutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useExecutionRecord(id);

  const back = (
    <button
      onClick={() => navigate(paths.executions)}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to executions
    </button>
  );

  if (isError) {
    return (
      <div className="space-y-6">
        {back}
        <ErrorState title="Execution not found" onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        {back}
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {back}

      <PageHeader
        title={data.collection}
        description={`Execution ${data.id.slice(0, 8)} · ${formatDateTime(data.startedAt)}`}
        actions={<StatusBadge status={data.status} />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile icon={Hash} label="Total Requests" value={String(data.requests.length)} tone="blue" />
        <Tile icon={CheckCircle2} label="Passed" value={String(data.passed)} tone="emerald" />
        <Tile icon={XCircle} label="Failed" value={String(data.failed)} tone="rose" />
        <Tile icon={Clock} label="Duration" value={formatDuration(data.durationMs)} tone="amber" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-4 w-4" />
            Request Results
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <MethodBadge method={r.method} />
                  </TableCell>
                  <TableCell className="font-mono text-sm">{r.endpoint}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatMs(r.responseTimeMs)}
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "passed" ? (
                      <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="ml-auto h-4 w-4 text-rose-400" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Tile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  tone: "emerald" | "rose" | "blue" | "amber";
}) {
  const tones = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    rose: "bg-rose-500/10 text-rose-400",
    blue: "bg-blue-500/10 text-blue-400",
    amber: "bg-amber-500/10 text-amber-400",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

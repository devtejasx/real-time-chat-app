import { Github, Globe, Moon, Save, Server, Sun } from "lucide-react";
import { PageHeader } from "@/components/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks";
import type { Environment } from "@/types";

const POSTMAN_ENVIRONMENTS = ["Local Dev", "Staging", "Production", "QA Sandbox"];

export function SettingsPage() {
  const { settings, update, updateGithub } = useSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure appearance, environments and integrations."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
            <CardDescription>Customize how the dashboard looks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
              <div className="flex items-center gap-3">
                {settings.theme === "dark" ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-400" />
                )}
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">
                    {settings.theme === "dark" ? "Dark mode" : "Light mode"}
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.theme === "dark"}
                onCheckedChange={(checked) =>
                  update({ theme: checked ? "dark" : "light" })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Environment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Environment</CardTitle>
            <CardDescription>
              Select the target environment for test runs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Active environment</Label>
              <Select
                value={settings.environment}
                onValueChange={(v) => update({ environment: v as Environment })}
              >
                <SelectTrigger>
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Postman environment</Label>
              <Select
                value={settings.postmanEnvironment}
                onValueChange={(v) => update({ postmanEnvironment: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSTMAN_ENVIRONMENTS.map((env) => (
                    <SelectItem key={env} value={env}>
                      {env}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* API connection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4" />
              API Connection
            </CardTitle>
            <CardDescription>
              Base URL of the backend the dashboard fetches data from.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="apiUrl">Backend API URL</Label>
            <Input
              id="apiUrl"
              value={settings.apiUrl}
              onChange={(e) => update({ apiUrl: e.target.value })}
              placeholder="http://localhost:8080/api"
            />
            <p className="text-xs text-muted-foreground">
              Applied to every request immediately — no reload required. Falls back
              to <span className="font-mono">VITE_API_BASE_URL</span> when empty.
            </p>
          </CardContent>
        </Card>

        {/* GitHub configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Github className="h-4 w-4" />
              GitHub Configuration
            </CardTitle>
            <CardDescription>
              Connect a repository and workflow for CI-triggered runs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="repo">Repository</Label>
                <Input
                  id="repo"
                  value={settings.github.repository}
                  onChange={(e) => updateGithub({ repository: e.target.value })}
                  placeholder="owner/repo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workflow">Workflow file</Label>
                <Input
                  id="workflow"
                  value={settings.github.workflow}
                  onChange={(e) => updateGithub({ workflow: e.target.value })}
                  placeholder="ci.yml"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Access token</Label>
              <Input
                id="token"
                type="password"
                value={settings.github.token}
                onChange={(e) => updateGithub({ token: e.target.value })}
                placeholder="ghp_…"
              />
              <p className="text-xs text-muted-foreground">
                Stored locally in your browser only. Never sent anywhere in this demo.
              </p>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button>
                <Save className="h-4 w-4" />
                Save changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

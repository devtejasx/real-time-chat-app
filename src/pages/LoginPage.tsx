import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Boxes, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { paths } from "@/routes/paths";

const DEMO = [
  { label: "Admin", email: "admin@rats.dev", password: "Admin@12345" },
  { label: "Tester", email: "tester@rats.dev", password: "Password@123" },
  { label: "Viewer", email: "viewer@rats.dev", password: "Password@123" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast({ title: `Welcome back, ${user.name}`, variant: "success" });
      navigate(paths.dashboard);
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "Invalid credentials",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-glow-emerald">
            <Boxes className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">REST API Testing Suite</h1>
          <p className="text-sm text-muted-foreground">Sign in to run collections and manage tests</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@rats.dev"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <LogIn className="h-4 w-4" />
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <div className="mt-5 space-y-2 border-t border-border/60 pt-4">
              <p className="text-xs font-medium text-muted-foreground">Demo accounts</p>
              <div className="flex flex-wrap gap-2">
                {DEMO.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => {
                      setEmail(d.email);
                      setPassword(d.password);
                    }}
                    className="rounded-md border border-border bg-secondary/40 px-2.5 py-1 text-xs transition-colors hover:bg-secondary"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(paths.dashboard)}
              className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Continue as guest (read-only) →
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

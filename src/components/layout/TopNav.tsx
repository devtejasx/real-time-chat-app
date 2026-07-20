import { Bell, Command, LogIn, Menu, Play, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/common";
import { paths } from "@/routes/paths";

interface TopNavProps {
  onMenuClick: () => void;
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Top navigation bar: menu toggle, search, environment, run + user. */
export function TopNav({ onMenuClick }: TopNavProps) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { user, isAuthenticated, hasRole, logout } = useAuth();
  const { toast } = useToast();
  const canRun = hasRole("ADMIN", "TESTER");

  const handleLogout = async () => {
    await logout();
    toast({ title: "Signed out", variant: "info" });
    navigate(paths.login);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Fake command palette / search */}
      <button className="hidden h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:flex">
        <Search className="h-4 w-4" />
        <span>Search collections, reports…</span>
        <span className="ml-auto flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          <Command className="h-2.5 w-2.5" />K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Badge variant="info" className="hidden capitalize sm:inline-flex">
          {settings.environment}
        </Badge>

        {canRun && (
          <Button
            size="sm"
            onClick={() => navigate(paths.execution)}
            className="hidden sm:inline-flex"
          >
            <Play className="h-4 w-4" />
            Run Tests
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="text-sm font-medium text-rose-400">
                Authentication run failed
              </span>
              <span className="text-xs text-muted-foreground">
                8 assertions failed · 2 min ago
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex-col items-start gap-0.5">
              <span className="text-sm font-medium">Users API run passed</span>
              <span className="text-xs text-muted-foreground">
                67/68 passed · 14 min ago
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 text-sm font-semibold text-white"
                aria-label="Account"
              >
                {initials(user.name)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium normal-case tracking-normal text-foreground">
                    {user.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-normal normal-case tracking-normal text-muted-foreground">
                    {user.email}
                    <Badge variant="secondary" className="text-[10px]">
                      {user.role}
                    </Badge>
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(paths.settings)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-400" onClick={handleLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button size="sm" variant="outline" onClick={() => navigate(paths.login)}>
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
}

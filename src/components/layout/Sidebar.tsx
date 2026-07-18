import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Boxes,
  Container,
  FolderGit2,
  GaugeCircle,
  GitBranch,
  PlayCircle,
  Settings,
  ScrollText,
  X,
} from "lucide-react";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  to: string;
  icon: typeof GaugeCircle;
  end?: boolean;
}

const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", to: paths.dashboard, icon: GaugeCircle, end: true },
      { label: "Collections", to: paths.collections, icon: FolderGit2 },
      { label: "Test Execution", to: paths.execution, icon: PlayCircle },
      { label: "Executions", to: paths.executions, icon: Activity },
      { label: "Reports", to: paths.reports, icon: ScrollText },
    ],
  },
  {
    section: "Infrastructure",
    items: [
      { label: "CI/CD", to: paths.cicd, icon: GitBranch },
      { label: "Docker", to: paths.docker, icon: Container },
    ],
  },
  {
    section: "Configuration",
    items: [{ label: "Settings", to: paths.settings, icon: Settings }],
  },
];

interface SidebarProps {
  /** Mobile open state. */
  open: boolean;
  onClose: () => void;
}

/** Left navigation rail. Fixed on desktop, slide-over on mobile. */
export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card/50 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 text-white shadow-glow-emerald">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">API Suite</p>
              <p className="text-[11px] text-muted-foreground">Testing Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {NAV.map((group) => (
            <div key={group.section}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.section}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <motion.span
                              layoutId="sidebar-active"
                              className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary"
                            />
                          )}
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer status */}
        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium">All systems operational</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              v1.0
            </Badge>
          </div>
        </div>
      </aside>
    </>
  );
}

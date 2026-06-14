import { useState } from "react";
import { NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import { GraduationCap, LogOut, Lock, Menu, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { mainNav, comingSoonNav } from "@/config/nav";
import { useAuthStore } from "@/store/auth";

function initials(name) {
  if (!name) return "AD";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Sidebar({ collapsed, onToggle }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b border-sidebar-border">
        <div className="grid place-items-center h-9 w-9 shrink-0 rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
            EduVault
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto touch-target"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {mainNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors touch-target",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent",
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}

        <div className="pt-4">
          {!collapsed && (
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Coming Soon
            </p>
          )}
          {comingSoonNav.map(({ to, label, icon: Icon }) => (
            <div
              key={to}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-muted-foreground/60 cursor-not-allowed touch-target"
              title={`${label} — Coming Soon`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{label}</span>
                  <Lock className="ml-auto h-4 w-4 shrink-0" />
                </>
              )}
            </div>
          ))}
        </div>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="grid place-items-center h-9 w-9 shrink-0 rounded-full bg-accent text-accent-foreground text-sm font-bold">
            {initials(user?.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name ?? "Admin"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className={cn("mt-3 w-full touch-target", collapsed && "px-0")}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </aside>
  );
}

function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="grid grid-cols-4">
        {mainNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium touch-target",
                isActive ? "text-primary" : "text-muted-foreground",
              )
            }
          >
            <Icon className="h-6 w-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

function MobileHeader() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center gap-2 h-14 px-4 border-b border-border bg-card/95 backdrop-blur">
      <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
        <GraduationCap className="h-4 w-4" />
      </div>
      <span className="font-bold tracking-tight">EduVault</span>
      <span className="ml-auto truncate max-w-[40%] text-sm text-muted-foreground">
        {user?.name ?? "Admin"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="touch-target"
        aria-label="Logout"
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 pb-24 md:pb-8">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

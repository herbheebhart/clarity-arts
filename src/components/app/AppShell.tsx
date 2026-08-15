import { Link, useRouterState } from "@tanstack/react-router";
import {
  Brain,
  ImageIcon,
  Library,
  Wand2,
  FolderKanban,
  Settings as SettingsIcon,
  Menu,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "AI Research", icon: Brain },
  { to: "/image-studio", label: "Image Studio", icon: ImageIcon },
  { to: "/prompt-library", label: "Prompt Library", icon: Library },
  { to: "/prompt-builder", label: "Prompt Builder", icon: Wand2 },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1.5">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            preload="intent"
            className={cn(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-[0.95rem] font-medium transition-all duration-200",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" strokeWidth={2} />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <span className="gradient-brand grid size-10 shrink-0 place-items-center rounded-2xl text-primary-foreground shadow-soft">
        <Sparkles className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display text-lg font-bold tracking-tight">
          VisionAI
        </span>
        <span className="block truncate text-xs text-muted-foreground">Creative AI workspace</span>
      </span>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-[270px] flex-col gap-8 border-r border-border bg-sidebar px-5 py-6 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto rounded-2xl gradient-soft p-4 text-sm text-muted-foreground">
          Tip: start in <span className="font-semibold text-foreground">Prompt Builder</span> to turn
          a simple idea into a pro prompt.
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-2xl" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] bg-sidebar px-5 py-6">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="mb-8">
                <Brand />
              </div>
              <NavList onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Brand />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
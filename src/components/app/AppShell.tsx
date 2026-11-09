import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Menu, Bell } from "lucide-react";
import { navItems, mobilePrimary } from "./nav";
import { Logo } from "./Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? path === "/" : path.startsWith(to);
        return (
          <Link key={to} to={to} onClick={onNavigate}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
            <Icon className={cn("size-[18px]", active && "text-sidebar-primary")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-8 bg-sidebar p-5">
      <Logo inverted />
      <NavList onNavigate={onNavigate} />
      <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
        <div className="text-xs font-semibold text-sidebar-accent-foreground">Modo demonstração</div>
        <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/80">Todos os dados exibidos são fictícios.</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block"><SidebarBody /></aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
        <button aria-label="Abrir menu" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border bg-card"><Menu className="size-5" /></button>
        <Logo />
        <button aria-label="Notificações" className="grid size-10 place-items-center rounded-xl border bg-card"><Bell className="size-5" /></button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 border-0 p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="pb-24 lg:pb-10 lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card/95 backdrop-blur lg:hidden">
        {navItems.filter((n) => mobilePrimary.includes(n.to)).map(({ to, short, icon: Icon }) => {
          const active = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link key={to} to={to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
              <Icon className="size-5" />{short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

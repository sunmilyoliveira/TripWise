import type { ReactNode, SelectHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/store";
import type { BudgetLevel } from "@/lib/finance";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold text-navy sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-surface p-5 sm:p-6", className)}>
      {title && <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold text-navy">{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

export function StatCard({ label, value, icon: Icon, hint, tone = "default" }: { label: string; value: string; icon: LucideIcon; hint?: string; tone?: "default" | "positive" | "negative" | "navy" }) {
  const navy = tone === "navy";
  return (
    <div className={cn("rounded-2xl border p-5 shadow-soft", navy ? "border-transparent bg-navy text-navy-foreground" : "bg-card")}>
      <div className="flex items-center justify-between gap-2">
        <span className={cn("text-xs font-medium", navy ? "text-navy-muted" : "text-muted-foreground")}>{label}</span>
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg",
          navy ? "bg-sidebar-accent text-sidebar-primary" : tone === "positive" ? "bg-positive-soft text-positive" : tone === "negative" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground")}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className={cn("mt-3 font-display text-xl font-semibold tabular sm:text-2xl xl:text-xl", navy ? "" : "text-navy")}>{value}</div>
      {hint && <div className={cn("mt-1 text-xs", navy ? "text-navy-muted" : "text-muted-foreground")}>{hint}</div>}
    </div>
  );
}

export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "?";

export function Avatar({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const name = useAppState((s) => s.participants.find((p) => p.id === id)?.name ?? "?");
  return <span title={name} className={cn("grid shrink-0 place-items-center rounded-full bg-secondary font-semibold text-secondary-foreground ring-2 ring-card", size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs")}>{initialsOf(name)}</span>;
}
export function AvatarStack({ ids }: { ids: string[] }) {
  return <div className="flex -space-x-2">{ids.slice(0, 5).map((id) => <Avatar key={id} id={id} size="sm" />)}</div>;
}
export function PersonName({ id }: { id: string }) {
  return <>{useAppState((s) => s.participants.find((p) => p.id === id)?.name ?? "Removido")}</>;
}

export function ProgressBar({ value, level }: { value: number; level?: BudgetLevel }) {
  const v = Math.min(100, Math.max(0, value));
  return <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", level === "excedido" ? "bg-destructive" : level === "alerta" ? "bg-warning" : "bg-primary")} style={{ width: `${v}%` }} /></div>;
}

export function BudgetAlert({ level, label }: { level: BudgetLevel; label: string }) {
  if (level === "ok") return null;
  return (
    <div className={cn("flex items-start gap-2 rounded-xl p-3 text-xs", level === "excedido" ? "bg-destructive/10 text-destructive" : "bg-warning-soft text-warning")}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <span>{level === "excedido" ? `Orçamento ultrapassado: ${label}` : `Perto do limite: ${label}`}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground"><Icon className="size-6" /></span>
      <h3 className="mt-4 text-base font-semibold text-navy">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function NativeSelect({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}>{children}</select>;
}

export function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", active ? "border-primary bg-accent text-accent-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>{children}</button>;
}

export function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition-colors", active ? "border-navy bg-navy text-navy-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>{children}</button>;
}

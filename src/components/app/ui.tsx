import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { participantById } from "@/lib/demo-data";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold text-navy sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function DemoBadge() {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-[11px] font-semibold text-warning"><span className="size-1.5 rounded-full bg-warning" />Dados demonstrativos</span>;
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card-surface p-5 sm:p-6", className)}>
      {title && <div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-base font-semibold text-navy">{title}</h2>{action}</div>}
      {children}
    </section>
  );
}

export function StatCard({ label, value, icon: Icon, hint, tone = "default" }: { label: string; value: string; icon: LucideIcon; hint?: string; tone?: "default" | "positive" | "negative" | "navy" }) {
  const navy = tone === "navy";
  return (
    <div className={cn("rounded-2xl border p-5 shadow-soft", navy ? "border-transparent bg-navy text-navy-foreground" : "bg-card")}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-medium", navy ? "text-navy-muted" : "text-muted-foreground")}>{label}</span>
        <span className={cn("grid size-8 place-items-center rounded-lg",
          navy ? "bg-sidebar-accent text-sidebar-primary" : tone === "positive" ? "bg-positive-soft text-positive" : tone === "negative" ? "bg-destructive/10 text-destructive" : "bg-accent text-accent-foreground")}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className={cn("mt-3 font-display text-2xl font-semibold tabular", navy ? "" : "text-navy")}>{value}</div>
      {hint && <div className={cn("mt-1 text-xs", navy ? "text-navy-muted" : "text-muted-foreground")}>{hint}</div>}
    </div>
  );
}

export function Avatar({ id, size = "md" }: { id: string; size?: "sm" | "md" }) {
  const p = participantById(id);
  return <span title={p.name} className={cn("grid shrink-0 place-items-center rounded-full bg-secondary font-semibold text-secondary-foreground ring-2 ring-card", size === "sm" ? "size-7 text-[10px]" : "size-9 text-xs")}>{p.initials}</span>;
}

export function AvatarStack({ ids }: { ids: string[] }) {
  return <div className="flex -space-x-2">{ids.map((id) => <Avatar key={id} id={id} size="sm" />)}</div>;
}

export function ProgressBar({ value }: { value: number }) {
  const v = Math.min(100, value);
  return <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", v > 90 ? "bg-destructive" : "bg-primary")} style={{ width: `${v}%` }} /></div>;
}

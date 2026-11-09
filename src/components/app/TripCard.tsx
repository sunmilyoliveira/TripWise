import { CalendarDays, Users } from "lucide-react";
import { type Trip, brl, fmtDate } from "@/lib/demo-data";
import { AvatarStack, ProgressBar } from "./ui";
import { cn } from "@/lib/utils";

const statusStyle: Record<Trip["status"], string> = {
  Planejando: "bg-card/90 text-navy",
  Confirmada: "bg-primary text-primary-foreground",
  "Em andamento": "bg-warning text-primary-foreground",
  Concluída: "bg-navy text-navy-foreground",
};

export function TripCard({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const pct = Math.round((trip.spent / trip.budget) * 100);
  return (
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <div className={cn("relative overflow-hidden", compact ? "h-36" : "h-44")}>
        <img src={trip.image} alt={`${trip.destination}, ${trip.country}`} loading="lazy" width={1024} height={768} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="photo-scrim absolute inset-0" />
        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold", statusStyle[trip.status])}>{trip.status}</span>
        <div className="absolute bottom-3 left-4 right-4 text-navy-foreground">
          <div className="text-xs opacity-80">{trip.destination}, {trip.country}</div>
          <h3 className="text-lg font-semibold">{trip.name}</h3>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{fmtDate(trip.start)} – {fmtDate(trip.end)}</span>
          <span className="flex items-center gap-2"><Users className="size-3.5" />{trip.participants.length}<AvatarStack ids={trip.participants} /></span>
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="font-semibold text-navy tabular">{brl(trip.spent)}</span>
            <span className="text-xs text-muted-foreground tabular">de {brl(trip.budget)} · {pct}%</span>
          </div>
          <ProgressBar value={pct} />
        </div>
      </div>
    </article>
  );
}

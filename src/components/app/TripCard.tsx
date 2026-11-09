import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Users } from "lucide-react";
import type { Trip } from "@/lib/types";
import { useAppState } from "@/lib/store";
import { budgetLevel, pctOf, sumAmount, tripExpenses, tripPhase } from "@/lib/finance";
import { fmt } from "@/lib/money";
import { fmtDate } from "@/lib/dates";
import { tripImage } from "@/lib/trip-image";
import { AvatarStack, ProgressBar } from "./ui";
import { cn } from "@/lib/utils";

const phaseStyle = { Futura: "bg-card/90 text-navy", "Em andamento": "bg-primary text-primary-foreground", Concluída: "bg-navy text-navy-foreground" };

export function TripCard({ trip, compact = false }: { trip: Trip; compact?: boolean }) {
  const spent = useAppState((s) => sumAmount(tripExpenses(s, trip.id)));
  const threshold = useAppState((s) => s.settings.alertThreshold);
  const pct = pctOf(spent, trip.budget);
  const phase = tripPhase(trip);
  const img = tripImage(trip.destination);
  return (
    <Link to="/viagens/$tripId" params={{ tripId: trip.id }} className="group block overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow hover:shadow-lift">
      <div className={cn("relative overflow-hidden bg-navy", compact ? "h-36" : "h-44")}>
        {img ? <img src={img} alt={trip.destination} loading="lazy" width={1024} height={768} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          : <div className="grid size-full place-items-center text-navy-muted"><MapPin className="size-10" /></div>}
        <div className="photo-scrim absolute inset-0" />
        <span className={cn("absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold", phaseStyle[phase])}>{phase}</span>
        <div className="absolute bottom-3 left-4 right-4 text-navy-foreground">
          <div className="text-xs opacity-80">{trip.destination}</div>
          <h3 className="text-lg font-semibold">{trip.name}</h3>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />{fmtDate(trip.start)} – {fmtDate(trip.end)}</span>
          <span className="flex items-center gap-2"><Users className="size-3.5" />{trip.participantIds.length}<AvatarStack ids={trip.participantIds} /></span>
        </div>
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
            <span className="font-semibold text-navy tabular">{fmt(spent, trip.currency)}</span>
            <span className="text-xs text-muted-foreground tabular">{trip.budget > 0 ? `de ${fmt(trip.budget, trip.currency)} · ${pct}%` : "sem orçamento"}</span>
          </div>
          <ProgressBar value={pct} level={budgetLevel(spent, trip.budget, threshold)} />
        </div>
      </div>
    </Link>
  );
}

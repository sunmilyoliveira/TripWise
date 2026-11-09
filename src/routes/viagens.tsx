import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, DemoBadge } from "@/components/app/ui";
import { TripCard } from "@/components/app/TripCard";
import { NewTripDialog } from "@/components/app/NewTripDialog";
import { trips, type TripStatus } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/viagens")({
  head: () => ({ meta: [
    { title: "Minhas viagens — TripWise" },
    { name: "description", content: "Todas as suas viagens com orçamento, datas, participantes e gastos." },
    { property: "og:title", content: "Minhas viagens — TripWise" },
    { property: "og:description", content: "Todas as suas viagens com orçamento, datas, participantes e gastos." },
  ] }),
  component: Trips,
});

const filters: ("Todas" | TripStatus)[] = ["Todas", "Planejando", "Confirmada", "Concluída"];

function Trips() {
  const [f, setF] = useState<(typeof filters)[number]>("Todas");
  const list = f === "Todas" ? trips : trips.filter((t) => t.status === f);
  return (
    <>
      <PageHeader eyebrow="Viagens" title="Minhas viagens" description="Acompanhe orçamento e gastos de cada destino."
        action={<NewTripDialog><Button size="lg"><Plus />Nova viagem</Button></NewTripDialog>} />
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filters.map((x) => (
          <button key={x} onClick={() => setF(x)} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium transition-colors", f === x ? "border-navy bg-navy text-navy-foreground" : "bg-card text-muted-foreground hover:text-foreground")}>{x}</button>
        ))}
        <span className="ml-auto"><DemoBadge /></span>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((t) => <TripCard key={t.id} trip={t} />)}
        <NewTripDialog>
          <button className="grid min-h-72 place-items-center rounded-2xl border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            <span className="flex flex-col items-center gap-2 text-sm font-medium"><Plus className="size-6" />Planejar nova viagem</span>
          </button>
        </NewTripDialog>
      </div>
    </>
  );
}

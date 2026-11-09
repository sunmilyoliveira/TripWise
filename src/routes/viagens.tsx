import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState, FilterPill } from "@/components/app/ui";
import { TripCard } from "@/components/app/TripCard";
import { TripDialog } from "@/components/app/TripDialog";
import { useAppState } from "@/lib/store";
import { tripPhase, type TripPhase } from "@/lib/finance";

export const Route = createFileRoute("/viagens")({
  head: () => ({ meta: [
    { title: "Minhas viagens — TripWise" },
    { name: "description", content: "Crie, edite e acompanhe o orçamento das suas viagens futuras, em andamento e concluídas." },
    { property: "og:title", content: "Minhas viagens — TripWise" },
    { property: "og:description", content: "Crie, edite e acompanhe o orçamento das suas viagens futuras, em andamento e concluídas." },
  ] }),
  component: TripsLayout,
});

function TripsLayout() {
  const match = useMatchRoute();
  if (match({ to: "/viagens/$tripId", fuzzy: true })) return <Outlet />;
  return <Trips />;
}

const filters: ("Todas" | TripPhase)[] = ["Todas", "Futura", "Em andamento", "Concluída"];
function Trips() {
  const trips = useAppState((s) => s.trips);
  const [f, setF] = useState<(typeof filters)[number]>("Todas");
  const list = [...(f === "Todas" ? trips : trips.filter((t) => tripPhase(t) === f))].sort((a, b) => a.start.localeCompare(b.start));
  return (
    <>
      <PageHeader eyebrow="Viagens" title="Minhas viagens" description="Toque em uma viagem para ver o resumo, planejamento e compartilhamento."
        action={<TripDialog><Button size="lg"><Plus />Nova viagem</Button></TripDialog>} />
      {trips.length === 0 ? (
        <EmptyState icon={Plane} title="Nenhuma viagem cadastrada" text="Defina destino, datas, participantes e orçamento." action={<TripDialog><Button><Plus />Criar viagem</Button></TripDialog>} />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap gap-2">{filters.map((x) => <FilterPill key={x} active={f === x} onClick={() => setF(x)}>{x === "Futura" ? "Futuras" : x === "Concluída" ? "Concluídas" : x}</FilterPill>)}</div>
          {list.length === 0 && <p className="mb-6 text-sm text-muted-foreground">Nenhuma viagem nesta situação.</p>}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((t) => <TripCard key={t.id} trip={t} />)}
            <TripDialog>
              <button className="grid min-h-72 place-items-center rounded-2xl border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                <span className="flex flex-col items-center gap-2 text-sm font-medium"><Plus className="size-6" />Planejar nova viagem</span>
              </button>
            </TripDialog>
          </div>
        </>
      )}
    </>
  );
}

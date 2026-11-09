import { createFileRoute } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { EmptyState, Panel, PageHeader, PersonName } from "@/components/app/ui";
import { useAppState } from "@/lib/store";
import { byCategory, sumAmount, tripBalances, tripExpenses } from "@/lib/finance";
import { fmt } from "@/lib/money";
import { fmtDateLong } from "@/lib/dates";

export const Route = createFileRoute("/compartilhado/$token")({
  head: () => ({ meta: [
    { title: "Viagem compartilhada — TripWise" },
    { name: "description", content: "Resumo somente leitura de uma viagem compartilhada no TripWise." },
    { property: "og:title", content: "Viagem compartilhada — TripWise" },
    { property: "og:description", content: "Resumo somente leitura de uma viagem compartilhada no TripWise." },
    { name: "robots", content: "noindex" },
  ] }),
  component: Shared,
});

function Shared() {
  const { token } = Route.useParams();
  const s = useAppState((x) => x);
  const trip = s.trips.find((t) => t.shareLink?.token === token && t.shareLink.active);
  if (!trip) return <EmptyState icon={ShieldAlert} title="Link indisponível" text="Este link foi revogado ou não existe neste dispositivo. O acesso por outras pessoas depende de ativar o backend." />;
  const exps = tripExpenses(s, trip.id), bal = tripBalances(s, trip), c = trip.currency;
  return (
    <>
      <PageHeader eyebrow="Somente leitura" title={trip.name} description={`${trip.destination} · ${fmtDateLong(trip.start)} a ${fmtDateLong(trip.end)}`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Resumo"><p className="text-sm">Gasto: <strong>{fmt(sumAmount(exps), c)}</strong> de {fmt(trip.budget, c)}</p>
          <ul className="mt-3 space-y-1 text-sm">{byCategory(exps).map((x) => <li key={x.name} className="flex justify-between"><span>{x.name}</span><span className="tabular">{fmt(x.value, c)}</span></li>)}</ul></Panel>
        <Panel title="Saldos"><ul className="space-y-1 text-sm">{trip.participantIds.map((id) => <li key={id} className="flex justify-between"><PersonName id={id} /><span className="tabular">{fmt(bal[id] ?? 0, c)}</span></li>)}</ul></Panel>
      </div>
    </>
  );
}

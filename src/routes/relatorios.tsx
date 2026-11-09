import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, DemoBadge, ProgressBar } from "@/components/app/ui";
import { CategoryDonut, PlannedVsActual } from "@/components/app/charts";
import { trips, expenses, categoryTotals, brl } from "@/lib/demo-data";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [
    { title: "Relatórios — TripWise" },
    { name: "description", content: "Despesas por categoria, orçamento planejado versus realizado e resumo das viagens." },
    { property: "og:title", content: "Relatórios — TripWise" },
    { property: "og:description", content: "Despesas por categoria, orçamento planejado versus realizado e resumo das viagens." },
  ] }),
  component: Reports,
});

function Reports() {
  const bars = trips.map((t) => ({ name: t.destination, Planejado: t.budget, Realizado: t.spent }));
  return (
    <>
      <PageHeader eyebrow="Relatórios" title="Visão financeira" description="Como seu dinheiro está sendo usado em cada viagem." action={<DemoBadge />} />
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title="Planejado vs. realizado" className="lg:col-span-3"><PlannedVsActual data={bars} /></Panel>
        <Panel title="Despesas por categoria" className="lg:col-span-2"><CategoryDonut data={categoryTotals()} /></Panel>
      </div>
      <Panel title="Resumo por viagem" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-3 font-medium">Viagem</th><th className="pb-3 font-medium">Orçamento</th><th className="pb-3 font-medium">Gasto</th><th className="pb-3 font-medium">Restante</th><th className="w-40 pb-3 font-medium">Uso</th></tr></thead>
            <tbody className="divide-y">
              {trips.map((t) => {
                const pct = Math.round((t.spent / t.budget) * 100);
                return (
                  <tr key={t.id}>
                    <td className="py-3"><div className="font-semibold text-navy">{t.destination}</div><div className="text-xs text-muted-foreground">{expenses.filter((e) => e.tripId === t.id).length} despesas</div></td>
                    <td className="py-3 tabular">{brl(t.budget)}</td>
                    <td className="py-3 tabular">{brl(t.spent)}</td>
                    <td className="py-3 font-medium text-positive tabular">{brl(t.budget - t.spent)}</td>
                    <td className="py-3"><div className="flex items-center gap-2"><div className="flex-1"><ProgressBar value={pct} /></div><span className="text-xs text-muted-foreground tabular">{pct}%</span></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

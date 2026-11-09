import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel, ProgressBar, NativeSelect, StatCard } from "@/components/app/ui";
import { CategoryDonut, GroupedBars, Evolution } from "@/components/app/charts";
import { NoTrips } from "@/components/app/NoTrips";
import { useAppState } from "@/lib/store";
import { budgetLevel, byCategory, byParticipant, pctOf, sumAmount, tripPhase } from "@/lib/finance";
import { fmt } from "@/lib/money";
import { fmtDate, fmtDateLong } from "@/lib/dates";
import { CATEGORIES } from "@/lib/types";
import { CheckCircle2, Clock, Wallet } from "lucide-react";
import { tripBalances, suggestTransfers } from "@/lib/finance";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [
    { title: "Relatórios — TripWise" },
    { name: "description", content: "Gastos por categoria e participante, planejado vs. realizado, evolução e histórico de viagens." },
    { property: "og:title", content: "Relatórios — TripWise" },
    { property: "og:description", content: "Gastos por categoria e participante, planejado vs. realizado, evolução e histórico de viagens." },
  ] }),
  component: Reports,
});

function Reports() {
  const s = useAppState((x) => x);
  const [tripId, setTripId] = useState("all");
  const [cat, setCat] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  if (!s.trips.length) return <><PageHeader eyebrow="Relatórios" title="Visão financeira" /><NoTrips /></>;

  const cur = tripId === "all" ? s.settings.currency : s.trips.find((t) => t.id === tripId)!.currency;
  const trips = s.trips.filter((t) => (tripId === "all" ? t.currency === cur : t.id === tripId));
  const ids = new Set(trips.map((t) => t.id));
  const exps = s.expenses.filter((e) => ids.has(e.tripId) && (cat === "all" || e.category === cat) && (!from || e.date >= from) && (!to || e.date <= to));
  const pays = s.payments.filter((p) => ids.has(p.tripId) && (!from || p.date >= from) && (!to || p.date <= to));
  const pending = trips.reduce((a, t) => a + suggestTransfers(tripBalances(s, t)).reduce((x, y) => x + y.amount, 0), 0);

  const { consumed, paid } = byParticipant(exps);
  const people = [...new Set([...Object.keys(consumed), ...Object.keys(paid)])];
  const partData = people.map((id) => ({ name: s.participants.find((p) => p.id === id)?.name.split(" ")[0] ?? "?", Pagou: paid[id] ?? 0, Consumiu: consumed[id] ?? 0 }));
  const pva = cat === "all"
    ? trips.map((t) => ({ name: t.name, Planejado: t.budget, Realizado: sumAmount(exps.filter((e) => e.tripId === t.id)) }))
    : trips.map((t) => ({ name: t.name, Planejado: t.categoryBudgets[cat as (typeof CATEGORIES)[number]] ?? 0, Realizado: sumAmount(exps.filter((e) => e.tripId === t.id)) }));
  const byDay = new Map<string, number>();
  [...exps].sort((a, b) => a.date.localeCompare(b.date)).forEach((e) => byDay.set(e.date, (byDay.get(e.date) ?? 0) + e.amount));
  let acc = 0;
  const evo = [...byDay].map(([d, v]) => ({ name: fmtDate(d), Diário: v, Acumulado: (acc += v) }));

  return (
    <>
      <PageHeader eyebrow="Relatórios" title="Visão financeira" description={`Valores em ${cur}.${tripId === "all" && trips.length < s.trips.length ? " Viagens em outra moeda: selecione-as individualmente." : ""}`} />
      <div className="card-surface mb-6 grid gap-3 p-4 sm:grid-cols-4">
        <div className="grid gap-1.5"><Label className="text-xs">Viagem</Label><NativeSelect value={tripId} onChange={(e) => setTripId(e.target.value)}><option value="all">Todas ({s.settings.currency})</option>{s.trips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</NativeSelect></div>
        <div className="grid gap-1.5"><Label className="text-xs">Categoria</Label><NativeSelect value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">Todas</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</NativeSelect></div>
        <div className="grid gap-1.5"><Label className="text-xs" htmlFor="r-from">De</Label><Input id="r-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label className="text-xs" htmlFor="r-to">Até</Label><Input id="r-to" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} /></div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard tone="navy" label="Total pago em despesas" value={fmt(sumAmount(exps), cur)} icon={Wallet} hint={`${exps.length} despesas`} />
        <StatCard tone="positive" label="Acertos recebidos/pagos" value={fmt(sumAmount(pays), cur)} icon={CheckCircle2} hint={`${pays.length} pagamentos`} />
        <StatCard tone="negative" label="Pendente entre participantes" value={fmt(pending, cur)} icon={Clock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title="Planejado vs. realizado" className="lg:col-span-3"><GroupedBars data={pva} keys={["Planejado", "Realizado"]} currency={cur} /></Panel>
        <Panel title="Gastos por categoria" className="lg:col-span-2"><CategoryDonut data={byCategory(exps)} currency={cur} /></Panel>
        <Panel title="Gastos por participante" className="lg:col-span-2"><GroupedBars data={partData} keys={["Pagou", "Consumiu"]} currency={cur} /></Panel>
        <Panel title="Evolução das despesas" className="lg:col-span-3"><Evolution data={evo} currency={cur} /></Panel>
      </div>

      <Panel title="Resumo e histórico de viagens" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground"><th className="pb-3 font-medium">Viagem</th><th className="pb-3 font-medium">Situação</th><th className="pb-3 font-medium">Orçamento</th><th className="pb-3 font-medium">Gasto</th><th className="pb-3 font-medium">Restante</th><th className="w-40 pb-3 font-medium">Uso</th></tr></thead>
            <tbody className="divide-y">
              {[...s.trips].sort((a, b) => b.start.localeCompare(a.start)).map((t) => {
                const sp = sumAmount(s.expenses.filter((e) => e.tripId === t.id)), p = pctOf(sp, t.budget);
                return (
                  <tr key={t.id}>
                    <td className="py-3"><div className="font-semibold text-navy">{t.name}</div><div className="text-xs text-muted-foreground">{fmtDateLong(t.start)}</div></td>
                    <td className="py-3 text-xs">{tripPhase(t)}</td>
                    <td className="py-3 tabular">{fmt(t.budget, t.currency)}</td>
                    <td className="py-3 tabular">{fmt(sp, t.currency)}</td>
                    <td className={`py-3 font-medium tabular ${t.budget - sp < 0 ? "text-destructive" : "text-positive"}`}>{fmt(t.budget - sp, t.currency)}</td>
                    <td className="py-3"><div className="flex items-center gap-2"><div className="flex-1"><ProgressBar value={p} level={budgetLevel(sp, t.budget, s.settings.alertThreshold)} /></div><span className="text-xs text-muted-foreground tabular">{p}%</span></div></td>
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

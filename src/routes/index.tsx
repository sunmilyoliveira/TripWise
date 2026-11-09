import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Plane, Wallet, Receipt, ArrowDownLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, Panel, DemoBadge, ProgressBar } from "@/components/app/ui";
import { TripCard } from "@/components/app/TripCard";
import { NewTripDialog } from "@/components/app/NewTripDialog";
import { CategoryDonut } from "@/components/app/charts";
import { trips, expenses, categoryTotals, balances, suggestTransfers, currentUserId, brl, participantById } from "@/lib/demo-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard — TripWise" },
    { name: "description", content: "Resumo financeiro das suas viagens: orçamento, despesas e saldos com amigos." },
    { property: "og:title", content: "Dashboard — TripWise" },
    { property: "og:description", content: "Resumo financeiro das suas viagens: orçamento, despesas e saldos com amigos." },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const budget = trips.reduce((a, t) => a + t.budget, 0);
  const spent = expenses.reduce((a, e) => a + e.amount, 0);
  const transfers = suggestTransfers();
  const perTrip = trips.map((t) => balances(expenses.filter((e) => e.tripId === t.id))[currentUserId] ?? 0);
  const toReceive = perTrip.filter((v) => v > 0).reduce((a, v) => a + v, 0);
  const toPay = -perTrip.filter((v) => v < 0).reduce((a, v) => a + v, 0);
  const pct = Math.round((spent / budget) * 100);
  const net = balances()[currentUserId] ?? 0;

  return (
    <>
      <div className="mb-3"><DemoBadge /></div>
      <PageHeader eyebrow="Segunda, 9 de novembro" title="Olá, Ana 👋" description="Suas finanças de viagem estão em dia. Você tem 3 viagens planejadas para os próximos meses."
        action={<NewTripDialog><Button size="lg" className="shadow-lift"><Plus />Nova viagem</Button></NewTripDialog>} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <div className="col-span-2 xl:col-span-1"><StatCard tone="navy" label="Orçamento total" value={brl(budget)} icon={Wallet} hint={`${trips.length} viagens`} /></div>
        <StatCard label="Viagens planejadas" value={String(trips.length)} icon={Plane} hint="Próxima em 39 dias" />
        <StatCard label="Despesas registradas" value={brl(spent)} icon={Receipt} hint={`${expenses.length} lançamentos`} />
        <StatCard tone="positive" label="A receber" value={brl(toReceive)} icon={ArrowDownLeft} hint="Saldo positivo por viagem" />
        <StatCard tone="negative" label="A pagar" value={brl(toPay)} icon={ArrowUpRight} hint={toPay ? "Pendente" : "Nada pendente"} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Próximas viagens</h2>
        <Link to="/viagens" className="flex items-center gap-1 text-sm font-medium text-primary">Ver todas<ArrowRight className="size-4" /></Link>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {trips.map((t) => <TripCard key={t.id} trip={t} compact />)}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        <Panel title="Distribuição das despesas" className="lg:col-span-3"><CategoryDonut data={categoryTotals()} /></Panel>
        <Panel title="Orçamento utilizado" className="lg:col-span-2">
          <div className="font-display text-4xl font-semibold text-navy tabular">{pct}%</div>
          <p className="mt-1 text-sm text-muted-foreground">{brl(spent)} de {brl(budget)}</p>
          <div className="mt-4"><ProgressBar value={pct} /></div>
          <ul className="mt-6 space-y-3">
            {trips.map((t) => {
              const p = Math.round((t.spent / t.budget) * 100);
              return <li key={t.id}><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium">{t.destination}</span><span className="text-muted-foreground tabular">{p}%</span></div><ProgressBar value={p} /></li>;
            })}
          </ul>
          <div className="mt-6 rounded-xl bg-positive-soft p-3 text-xs text-positive">
            Saldo líquido: <strong className="tabular">{brl(net)}</strong> {net >= 0 ? "a seu favor" : "a pagar"}. Maior credor: {participantById(transfers[0]?.to ?? currentUserId).name.split(" ")[0]}.
          </div>
        </Panel>
      </div>
    </>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Plane, Wallet, Receipt, ArrowDownLeft, ArrowUpRight, ArrowRight, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, StatCard, Panel, ProgressBar, EmptyState, BudgetAlert } from "@/components/app/ui";
import { TripCard } from "@/components/app/TripCard";
import { TripDialog } from "@/components/app/TripDialog";
import { ExpenseDialog } from "@/components/app/ExpenseDialog";
import { CategoryDonut } from "@/components/app/charts";
import { useAppState } from "@/lib/store";
import { budgetLevel, byCategory, pctOf, sumAmount, tripExpenses, tripPhase, userSummary } from "@/lib/finance";
import { fmt } from "@/lib/money";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard — TripWise" },
    { name: "description", content: "Resumo financeiro das suas viagens: orçamento, gastos, saldo e acertos com amigos." },
    { property: "og:title", content: "Dashboard — TripWise" },
    { property: "og:description", content: "Resumo financeiro das suas viagens: orçamento, gastos, saldo e acertos com amigos." },
  ] }),
  component: Dashboard,
});

function Dashboard() {
  const s = useAppState((x) => x);
  const cur = s.settings.currency;
  const sum = userSummary(s, cur);
  const tripIds = new Set(sum.trips.map((t) => t.id));
  const exps = s.expenses.filter((e) => tripIds.has(e.tripId));
  const pct = pctOf(sum.spent, sum.planned);
  const upcoming = [...s.trips].filter((t) => tripPhase(t) !== "Concluída").sort((a, b) => a.start.localeCompare(b.start));
  const first = s.profile.name.split(" ")[0];
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  if (!s.trips.length) {
    return (
      <>
        <PageHeader eyebrow={today} title={`Olá, ${first}`} description="Comece criando sua primeira viagem. Todos os números aqui serão calculados a partir do que você registrar." />
        <EmptyState icon={Plane} title="Nenhuma viagem ainda" text="Crie uma viagem, adicione participantes e registre despesas para ver o resumo financeiro."
          action={<TripDialog><Button size="lg"><Plus />Nova viagem</Button></TripDialog>} />
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={today} title={`Olá, ${first}`} description={`${upcoming.length} ${upcoming.length === 1 ? "viagem" : "viagens"} pela frente.`}
        action={<><ExpenseDialog><Button variant="outline" size="lg"><Receipt />Nova despesa</Button></ExpenseDialog><TripDialog><Button size="lg" className="shadow-lift"><Plus />Nova viagem</Button></TripDialog></>} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-5">
        <div className="col-span-2 xl:col-span-1"><StatCard tone="navy" label="Total planejado" value={fmt(sum.planned, cur)} icon={Wallet} hint={`${sum.trips.length} viagens em ${cur}`} /></div>
        <StatCard label="Total gasto" value={fmt(sum.spent, cur)} icon={Receipt} hint={`${exps.length} despesas`} />
        <StatCard tone={sum.available < 0 ? "negative" : "default"} label="Saldo disponível" value={fmt(sum.available, cur)} icon={PiggyBank} hint={sum.available < 0 ? "Acima do planejado" : "Restante do orçamento"} />
        <StatCard tone="positive" label="A receber" value={fmt(sum.toReceive, cur)} icon={ArrowDownLeft} hint="Dos participantes" />
        <StatCard tone="negative" label="A pagar" value={fmt(sum.toPay, cur)} icon={ArrowUpRight} hint={sum.toPay ? "Veja o acerto de contas" : "Nada pendente"} />
      </div>
      {sum.otherCurrency > 0 && <p className="mt-3 text-xs text-muted-foreground">{sum.otherCurrency} viagem(ns) em outra moeda não entram nestes totais.</p>}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Próximas viagens</h2>
        <Link to="/viagens" className="flex items-center gap-1 text-sm font-medium text-primary">Ver todas<ArrowRight className="size-4" /></Link>
      </div>
      {upcoming.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{upcoming.slice(0, 3).map((t) => <TripCard key={t.id} trip={t} compact />)}</div>
        : <p className="mt-4 text-sm text-muted-foreground">Nenhuma viagem futura ou em andamento.</p>}

      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        <Panel title="Despesas por categoria" className="lg:col-span-3"><CategoryDonut data={byCategory(exps)} currency={cur} /></Panel>
        <Panel title="Orçamento utilizado" className="lg:col-span-2">
          <div className="font-display text-4xl font-semibold text-navy tabular">{pct}%</div>
          <p className="mt-1 text-sm text-muted-foreground">{fmt(sum.spent, cur)} de {fmt(sum.planned, cur)}</p>
          <div className="mt-4"><ProgressBar value={pct} level={budgetLevel(sum.spent, sum.planned, s.settings.alertThreshold)} /></div>
          <ul className="mt-6 space-y-3">
            {sum.trips.map((t) => {
              const sp = sumAmount(tripExpenses(s, t.id));
              const lv = budgetLevel(sp, t.budget, s.settings.alertThreshold);
              return (
                <li key={t.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs"><span className="font-medium">{t.name}</span><span className="text-muted-foreground tabular">{pctOf(sp, t.budget)}%</span></div>
                  <ProgressBar value={pctOf(sp, t.budget)} level={lv} />
                  {s.settings.budgetAlerts && <BudgetAlert level={lv} label={`${t.name} (${fmt(sp, t.currency)} de ${fmt(t.budget, t.currency)})`} />}
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}

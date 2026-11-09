import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Avatar, EmptyState, PersonName } from "@/components/app/ui";
import { TripPicker, useSelectedTrip } from "@/components/app/TripPicker";
import { ExpenseDialog } from "@/components/app/ExpenseDialog";
import { AddParticipantInline } from "@/components/app/AddParticipantInline";
import { NoTrips } from "@/components/app/NoTrips";
import { removeParticipant, useAppState } from "@/lib/store";
import { byParticipant, tripBalances, tripExpenses } from "@/lib/finance";
import { fmt } from "@/lib/money";
import { fmtDate } from "@/lib/dates";
import { ME, SPLIT_MODES } from "@/lib/types";
import { Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/divisao")({
  head: () => ({ meta: [
    { title: "Divisão de despesas — TripWise" },
    { name: "description", content: "Veja quem pagou, quanto cada participante consumiu, deve ou tem a receber." },
    { property: "og:title", content: "Divisão de despesas — TripWise" },
    { property: "og:description", content: "Veja quem pagou, quanto cada participante consumiu, deve ou tem a receber." },
  ] }),
  component: Split,
});

function Split() {
  const s = useAppState((x) => x);
  const { trip, setTripId } = useSelectedTrip();
  return (
    <>
      <PageHeader eyebrow="Divisão" title="Divisão de despesas" description="Saldos calculados a partir das despesas e pagamentos registrados."
        action={trip && <><TripPicker value={trip.id} onChange={setTripId} /><ExpenseDialog tripId={trip.id}><Button><Plus />Despesa</Button></ExpenseDialog></>} />
      {!trip ? <NoTrips /> : (() => {
        const c = trip.currency;
        const exps = tripExpenses(s, trip.id);
        const bal = tripBalances(s, trip);
        const { consumed, paid } = byParticipant(exps);
        const shared = exps.filter((e) => Object.keys(e.shares).length > 1 || e.paidBy !== Object.keys(e.shares)[0]);
        return (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {trip.participantIds.map((id) => {
                const v = bal[id] ?? 0;
                return (
                  <div key={id} className="card-surface p-4">
                    <div className="flex items-center gap-3"><Avatar id={id} /><div className="truncate text-sm font-semibold text-navy"><PersonName id={id} /></div></div>
                    <div className={cn("mt-4 font-display text-xl font-semibold tabular", v > 0 ? "text-positive" : v < 0 ? "text-destructive" : "text-navy")}>{v > 0 ? "+" : v < 0 ? "−" : ""}{fmt(Math.abs(v), c)}</div>
                    <div className="text-xs text-muted-foreground">{v > 0 ? "tem a receber" : v < 0 ? "deve pagar" : "quitado"}</div>
                    <div className="mt-3 border-t pt-3 text-[11px] text-muted-foreground tabular">Pagou {fmt(paid[id] ?? 0, c)} · Consumiu {fmt(consumed[id] ?? 0, c)}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Panel title="Histórico de despesas compartilhadas" className="lg:col-span-2">
                {!shared.length ? <EmptyState icon={Users} title="Nada dividido ainda" text="Registre uma despesa com mais de um participante." /> :
                <ul className="space-y-4">
                  {[...shared].sort((a, b) => b.date.localeCompare(a.date)).map((e) => (
                    <li key={e.id} className="rounded-xl border p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div><div className="text-sm font-semibold text-navy">{e.description}</div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Avatar id={e.paidBy} size="sm" />Pago por <PersonName id={e.paidBy} /> · {fmtDate(e.date)} · {SPLIT_MODES[e.splitMode]}</div></div>
                        <div className="font-semibold text-navy tabular">{fmt(e.amount, c)}</div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(e.shares).map(([id, v]) => <span key={id} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground tabular"><PersonName id={id} /> · {fmt(v, c)}</span>)}
                      </div>
                    </li>
                  ))}
                </ul>}
              </Panel>
              <Panel title="Cadastro de participantes">
                <ul className="mb-4 divide-y">
                  {s.participants.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2"><Avatar id={p.id} size="sm" /><span className="truncate">{p.name}</span></span>
                      {p.id !== ME && <button aria-label={`Remover ${p.name}`} className="text-muted-foreground hover:text-destructive" onClick={() => { const r = removeParticipant(p.id); r.ok ? toast.success("Participante removido") : toast.error(r.error); }}><Trash2 className="size-4" /></button>}
                    </li>
                  ))}
                </ul>
                <AddParticipantInline />
                <p className="mt-3 text-xs text-muted-foreground">Para incluir alguém nesta viagem, edite a viagem e selecione o participante.</p>
              </Panel>
            </div>
          </>
        );
      })()}
    </>
  );
}

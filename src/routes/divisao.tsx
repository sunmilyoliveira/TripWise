import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Avatar, DemoBadge } from "@/components/app/ui";
import { expenses, trips, participants, balances, paymentHistory, brl, fmtDate, participantById } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/divisao")({
  head: () => ({ meta: [
    { title: "Divisão de despesas — TripWise" },
    { name: "description", content: "Veja quem pagou, quanto cada participante deve e tem a receber." },
    { property: "og:title", content: "Divisão de despesas — TripWise" },
    { property: "og:description", content: "Veja quem pagou, quanto cada participante deve e tem a receber." },
  ] }),
  component: Split,
});

function Split() {
  const [mode, setMode] = useState<"igual" | "personalizada">("igual");
  const trip = trips[1]!;
  const list = expenses.filter((e) => e.tripId === trip.id);
  const bal = balances(list);
  return (
    <>
      <PageHeader eyebrow={`${trip.destination} · ${trip.participants.length} participantes`} title="Divisão de despesas" description="Saldos calculados a partir das despesas compartilhadas da viagem." action={<DemoBadge />} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {trip.participants.map((id) => {
          const v = bal[id] ?? 0;
          return (
            <div key={id} className="card-surface p-4">
              <div className="flex items-center gap-3"><Avatar id={id} /><div className="text-sm font-semibold text-navy">{participantById(id).name.split(" ")[0]}</div></div>
              <div className={cn("mt-4 font-display text-xl font-semibold tabular", v >= 0 ? "text-positive" : "text-destructive")}>{v >= 0 ? "+" : "−"}{brl(Math.abs(v))}</div>
              <div className="text-xs text-muted-foreground">{v >= 0 ? "tem a receber" : "deve ao grupo"}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Despesas compartilhadas" className="lg:col-span-2"
          action={<div className="flex rounded-full bg-muted p-1 text-xs font-medium">
            {(["igual", "personalizada"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className={cn("rounded-full px-3 py-1.5 capitalize", mode === m ? "bg-card text-navy shadow-soft" : "text-muted-foreground")}>{m === "igual" ? "Igualitária" : "Personalizada"}</button>)}
          </div>}>
          <ul className="space-y-4">
            {list.map((e) => {
              const shares = mode === "igual" ? Object.fromEntries(trip.participants.map((p) => [p, e.amount / trip.participants.length])) : e.shares;
              return (
                <li key={e.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="text-sm font-semibold text-navy">{e.title}</div><div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Avatar id={e.paidBy} size="sm" />Pago por {participantById(e.paidBy).name}</div></div>
                    <div className="font-semibold text-navy tabular">{brl(e.amount)}</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(shares).map(([id, v]) => <span key={id} className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground tabular">{participantById(id).initials} · {brl(v)}</span>)}
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Histórico de pagamentos">
          <ul className="space-y-4">
            {paymentHistory.map((p) => (
              <li key={p.id} className="flex items-center gap-3">
                <Avatar id={p.from} size="sm" />
                <div className="min-w-0 flex-1 text-xs"><div className="font-medium text-foreground">{participantById(p.from).name.split(" ")[0]} → {participantById(p.to).name.split(" ")[0]}</div><div className="text-muted-foreground">{fmtDate(p.date)}</div></div>
                <div className="text-right"><div className="text-sm font-semibold tabular">{brl(p.amount)}</div><div className={cn("text-[11px] font-medium", p.status === "Recebido" ? "text-positive" : "text-warning")}>{p.status}</div></div>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">{participants.length} pessoas no seu círculo de viagem.</p>
        </Panel>
      </div>
    </>
  );
}

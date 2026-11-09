import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowRight, Clock, CircleDollarSign, CheckCircle2, Trash2, HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Avatar, StatCard, EmptyState, PersonName } from "@/components/app/ui";
import { TripPicker, useSelectedTrip } from "@/components/app/TripPicker";
import { PaymentDialog } from "@/components/app/PaymentDialog";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { NoTrips } from "@/components/app/NoTrips";
import { deletePayment, useAppState } from "@/lib/store";
import { suggestTransfers, tripBalances } from "@/lib/finance";
import { fmt } from "@/lib/money";
import { fmtDateLong } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/acerto")({
  head: () => ({ meta: [
    { title: "Acerto de contas — TripWise" },
    { name: "description", content: "Quem deve, quanto e para quem, com transferências mínimas e registro de pagamentos." },
    { property: "og:title", content: "Acerto de contas — TripWise" },
    { property: "og:description", content: "Quem deve, quanto e para quem, com transferências mínimas e registro de pagamentos." },
  ] }),
  component: Settle,
});

function Settle() {
  const s = useAppState((x) => x);
  const { trip, setTripId } = useSelectedTrip();
  return (
    <>
      <PageHeader eyebrow="Acerto de contas" title="Quem paga quem" description="O app só registra os acertos — nenhum pagamento real é feito."
        action={trip && <TripPicker value={trip.id} onChange={setTripId} />} />
      {!trip ? <NoTrips /> : (() => {
        const c = trip.currency;
        const bal = tripBalances(s, trip);
        const transfers = suggestTransfers(bal);
        const pending = transfers.reduce((a, t) => a + t.amount, 0);
        const pays = s.payments.filter((p) => p.tripId === trip.id).sort((a, b) => b.date.localeCompare(a.date));
        const paid = pays.reduce((a, p) => a + p.amount, 0);
        return (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard tone="navy" label="Total pendente" value={fmt(pending, c)} icon={CircleDollarSign} hint={`${transfers.length} transferência(s) sugerida(s)`} />
              <StatCard tone="positive" label="Já acertado" value={fmt(paid, c)} icon={CheckCircle2} hint={`${pays.length} pagamento(s)`} />
              <StatCard tone={pending ? "negative" : "positive"} label="Situação" value={pending ? "Pendente" : "Quitado"} icon={Clock} />
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Panel title="Transferências sugeridas" className="lg:col-span-2">
                {!transfers.length ? <EmptyState icon={HandCoins} title="Tudo quitado" text="Ninguém deve nada nesta viagem." /> :
                <ul className="space-y-3">
                  {transfers.map((t) => (
                    <li key={`${t.from}-${t.to}`} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
                      <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
                        <Avatar id={t.from} /><span className="font-semibold text-navy"><PersonName id={t.from} /></span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">deve <ArrowRight className="size-4" /></span>
                        <Avatar id={t.to} /><span className="font-semibold text-navy"><PersonName id={t.to} /></span>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="font-display text-lg font-semibold text-navy tabular">{fmt(t.amount, c)}</span>
                        <PaymentDialog tripId={trip.id} from={t.from} to={t.to} owed={t.amount} currency={c}><Button size="sm">Registrar pagamento</Button></PaymentDialog>
                      </div>
                    </li>
                  ))}
                </ul>}
              </Panel>
              <Panel title="Saldo por participante">
                <ul className="space-y-3">
                  {trip.participantIds.map((id) => {
                    const v = bal[id] ?? 0;
                    return (
                      <li key={id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2"><Avatar id={id} size="sm" /><PersonName id={id} /></span>
                        <span className={cn("text-right font-semibold tabular", v > 0 ? "text-positive" : v < 0 ? "text-destructive" : "text-muted-foreground")}>
                          {v > 0 ? `recebe ${fmt(v, c)}` : v < 0 ? `deve ${fmt(-v, c)}` : "quitado"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            </div>

            <Panel title="Histórico de pagamentos" className="mt-4">
              {!pays.length ? <p className="text-sm text-muted-foreground">Nenhum pagamento registrado.</p> :
              <ul className="divide-y">
                {pays.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <Avatar id={p.from} size="sm" />
                    <div className="min-w-0 flex-1 text-sm"><div className="font-medium"><PersonName id={p.from} /> → <PersonName id={p.to} /></div><div className="text-xs text-muted-foreground">{fmtDateLong(p.date)}{p.note && ` · ${p.note}`}</div></div>
                    <div className="font-semibold tabular">{fmt(p.amount, c)}</div>
                    <ConfirmDelete title="Excluir pagamento?" text="O saldo voltará a ficar pendente." onConfirm={() => { deletePayment(p.id); toast.success("Pagamento excluído"); }}>
                      <Button size="icon" variant="ghost" aria-label="Excluir pagamento"><Trash2 /></Button>
                    </ConfirmDelete>
                  </li>
                ))}
              </ul>}
            </Panel>
          </>
        );
      })()}
    </>
  );
}

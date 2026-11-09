import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Clock, CircleDollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Avatar, StatCard, DemoBadge } from "@/components/app/ui";
import { suggestTransfers, paymentHistory, brl, participantById } from "@/lib/demo-data";

export const Route = createFileRoute("/acerto")({
  head: () => ({ meta: [
    { title: "Acerto de contas — TripWise" },
    { name: "description", content: "Resumo das dívidas e as transferências mínimas para zerar o grupo." },
    { property: "og:title", content: "Acerto de contas — TripWise" },
    { property: "og:description", content: "Resumo das dívidas e as transferências mínimas para zerar o grupo." },
  ] }),
  component: Settle,
});

function Settle() {
  const transfers = suggestTransfers();
  const [done, setDone] = useState<number[]>([]);
  const pending = transfers.filter((_, i) => !done.includes(i)).reduce((a, t) => a + t.amount, 0);
  const received = paymentHistory.filter((p) => p.status === "Recebido").reduce((a, p) => a + p.amount, 0);
  return (
    <>
      <PageHeader eyebrow="Acerto de contas" title="Quem paga quem" description="Sugerimos o menor número de transferências para quitar todas as dívidas." action={<DemoBadge />} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard tone="navy" label="Total em dívidas" value={brl(transfers.reduce((a, t) => a + t.amount, 0))} icon={CircleDollarSign} hint={`${transfers.length} transferências`} />
        <StatCard tone="negative" label="Valores pendentes" value={brl(pending)} icon={Clock} />
        <StatCard tone="positive" label="Valores recebidos" value={brl(received)} icon={CheckCircle2} />
      </div>
      <Panel title="Transferências sugeridas" className="mt-6">
        <ul className="space-y-3">
          {transfers.map((t, i) => {
            const ok = done.includes(i);
            return (
              <li key={i} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3">
                  <Avatar id={t.from} />
                  <div className="text-sm"><span className="font-semibold text-navy">{participantById(t.from).name}</span></div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <Avatar id={t.to} />
                  <div className="text-sm"><span className="font-semibold text-navy">{participantById(t.to).name}</span></div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <span className="font-display text-lg font-semibold text-navy tabular">{brl(t.amount)}</span>
                  {ok ? <span className="flex items-center gap-1 text-sm font-medium text-positive"><Check className="size-4" />Quitado</span>
                    : <Button size="sm" variant="outline" onClick={() => { setDone((d) => [...d, i]); toast.success("Pagamento marcado como quitado"); }}>Marcar como pago</Button>}
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}

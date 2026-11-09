import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, BedDouble, Car, UtensilsCrossed, Ticket, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, Avatar, DemoBadge } from "@/components/app/ui";
import { expenses, trips, brl, fmtDate, participantById, type Category } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/despesas")({
  head: () => ({ meta: [
    { title: "Despesas — TripWise" },
    { name: "description", content: "Todas as despesas registradas nas suas viagens, por categoria e pagador." },
    { property: "og:title", content: "Despesas — TripWise" },
    { property: "og:description", content: "Todas as despesas registradas nas suas viagens, por categoria e pagador." },
  ] }),
  component: Expenses,
});

export const categoryIcon: Record<Category, typeof Car> = { Hospedagem: BedDouble, Transporte: Car, Alimentação: UtensilsCrossed, Passeios: Ticket, Compras: ShoppingBag };

function Expenses() {
  const [trip, setTrip] = useState("all");
  const list = trip === "all" ? expenses : expenses.filter((e) => e.tripId === trip);
  return (
    <>
      <PageHeader eyebrow="Despesas" title="Despesas registradas" description={`${list.length} lançamentos · ${brl(list.reduce((a, e) => a + e.amount, 0))}`}
        action={<Button size="lg" onClick={() => toast("Cadastro de despesa disponível em breve (demonstração)")}><Plus />Nova despesa</Button>} />
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[{ id: "all", destination: "Todas" }, ...trips].map((t) => (
          <button key={t.id} onClick={() => setTrip(t.id)} className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", trip === t.id ? "border-navy bg-navy text-navy-foreground" : "bg-card text-muted-foreground")}>{t.destination}</button>
        ))}
        <span className="ml-auto"><DemoBadge /></span>
      </div>
      <Panel className="p-0 sm:p-0">
        <ul className="divide-y">
          {list.map((e) => {
            const Icon = categoryIcon[e.category];
            return (
              <li key={e.id} className="flex items-center gap-4 px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-navy">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.category} · {trips.find((t) => t.id === e.tripId)?.destination} · {fmtDate(e.date)}</div>
                </div>
                <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><Avatar id={e.paidBy} size="sm" />{participantById(e.paidBy).name.split(" ")[0]} pagou</div>
                <div className="text-right font-semibold text-navy tabular">{brl(e.amount)}</div>
              </li>
            );
          })}
        </ul>
      </Panel>
    </>
  );
}

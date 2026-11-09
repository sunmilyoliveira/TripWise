import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, FilterPill, NativeSelect } from "@/components/app/ui";
import { ExpenseDialog } from "@/components/app/ExpenseDialog";
import { ExpenseList } from "@/components/app/ExpenseList";
import { useAppState } from "@/lib/store";
import { CATEGORIES } from "@/lib/types";
import { fmt } from "@/lib/money";

export const Route = createFileRoute("/despesas")({
  head: () => ({ meta: [
    { title: "Despesas — TripWise" },
    { name: "description", content: "Registre, edite e exclua despesas das viagens com divisão entre participantes." },
    { property: "og:title", content: "Despesas — TripWise" },
    { property: "og:description", content: "Registre, edite e exclua despesas das viagens com divisão entre participantes." },
  ] }),
  component: Expenses,
});

function Expenses() {
  const trips = useAppState((s) => s.trips);
  const all = useAppState((s) => s.expenses);
  const [trip, setTrip] = useState("all");
  const [cat, setCat] = useState("all");
  const list = all.filter((e) => (trip === "all" || e.tripId === trip) && (cat === "all" || e.category === cat));
  const cur = trip !== "all" ? trips.find((t) => t.id === trip)?.currency : undefined;
  const sameCurrency = new Set(list.map((e) => trips.find((t) => t.id === e.tripId)?.currency)).size <= 1;
  return (
    <>
      <PageHeader eyebrow="Despesas" title="Despesas registradas"
        description={`${list.length} lançamentos${sameCurrency && list.length ? ` · ${fmt(list.reduce((a, e) => a + e.amount, 0), cur ?? trips.find((t) => t.id === list[0]?.tripId)?.currency)}` : ""}`}
        action={<ExpenseDialog tripId={trip === "all" ? undefined : trip}><Button size="lg" disabled={!trips.length}><Plus />Nova despesa</Button></ExpenseDialog>} />
      {trips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <FilterPill active={trip === "all"} onClick={() => setTrip("all")}>Todas</FilterPill>
          {trips.map((t) => <FilterPill key={t.id} active={trip === t.id} onClick={() => setTrip(t.id)}>{t.name}</FilterPill>)}
          <NativeSelect aria-label="Categoria" className="ml-auto w-44" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">Todas as categorias</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </NativeSelect>
        </div>
      )}
      {!trips.length ? <p className="text-sm text-muted-foreground">Crie uma viagem em "Minhas viagens" para registrar despesas.</p> : <ExpenseList expenses={list} showTrip />}
    </>
  );
}

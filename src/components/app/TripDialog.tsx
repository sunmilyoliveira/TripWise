import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveTrip, useAppState } from "@/lib/store";
import { CATEGORIES, CURRENCIES, ME, type Category, type Currency, type Trip } from "@/lib/types";
import { fmt } from "@/lib/money";
import { MoneyInput } from "./MoneyInput";
import { AddParticipantInline } from "./AddParticipantInline";
import { Chip, NativeSelect } from "./ui";

export function TripDialog({ children, trip, onSaved }: { children: ReactNode; trip?: Trip | undefined; onSaved?: (t: Trip) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {open && <TripForm trip={trip} onDone={(t) => { setOpen(false); onSaved?.(t); }} />}
      </DialogContent>
    </Dialog>
  );
}

function TripForm({ trip, onDone }: { trip?: Trip | undefined; onDone: (t: Trip) => void }) {
  const participants = useAppState((s) => s.participants);
  const defaultCurrency = useAppState((s) => s.settings.currency);
  const [name, setName] = useState(trip?.name ?? "");
  const [destination, setDestination] = useState(trip?.destination ?? "");
  const [start, setStart] = useState(trip?.start ?? "");
  const [end, setEnd] = useState(trip?.end ?? "");
  const [currency, setCurrency] = useState<Currency>(trip?.currency ?? defaultCurrency);
  const [budget, setBudget] = useState<number | null>(trip?.budget ?? null);
  const [ids, setIds] = useState<string[]>(trip?.participantIds ?? [ME]);
  const [cat, setCat] = useState<Partial<Record<Category, number>>>(trip?.categoryBudgets ?? {});
  const [ind, setInd] = useState<Record<string, number>>(trip?.individualBudgets ?? {});
  const catSum = Object.values(cat).reduce<number>((a, b) => a + (b ?? 0), 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInd = Object.fromEntries(Object.entries(ind).filter(([k, v]) => ids.includes(k) && v > 0));
    const cleanCat = Object.fromEntries(Object.entries(cat).filter(([, v]) => (v ?? 0) > 0));
    const r = saveTrip({ name, destination, start, end, currency, budget: budget ?? 0, participantIds: ids, categoryBudgets: cleanCat, individualBudgets: cleanInd }, trip?.id);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(trip ? "Viagem atualizada" : "Viagem criada");
    onDone(r.value);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-navy">{trip ? "Editar viagem" : "Nova viagem"}</DialogTitle>
        <DialogDescription>Destino, datas, participantes e orçamento.</DialogDescription>
      </DialogHeader>
      <form className="grid gap-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2"><Label htmlFor="t-name">Nome da viagem</Label><Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Férias em Lisboa" /></div>
          <div className="grid gap-2"><Label htmlFor="t-dest">Destino</Label><Input id="t-dest" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Cidade, país" /></div>
          <div className="grid gap-2"><Label htmlFor="t-start">Ida</Label><Input id="t-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="t-end">Volta</Label><Input id="t-end" type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="t-cur">Moeda</Label>
            <NativeSelect id="t-cur" value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</NativeSelect></div>
          <div className="grid gap-2"><Label htmlFor="t-budget">Orçamento coletivo</Label><MoneyInput id="t-budget" value={budget} onChange={setBudget} /></div>
        </div>

        <fieldset className="grid gap-3">
          <legend className="mb-2 text-sm font-medium">Participantes</legend>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => {
              const on = ids.includes(p.id);
              return <Chip key={p.id} active={on} onClick={() => p.id !== ME && setIds((s) => (on ? s.filter((x) => x !== p.id) : [...s, p.id]))}>{p.name}{p.id === ME && " (você)"}</Chip>;
            })}
          </div>
          <AddParticipantInline onAdded={(id) => setIds((s) => [...s, id])} />
        </fieldset>

        <details className="rounded-xl border p-4" open={!!trip && Object.keys(cat).length > 0}>
          <summary className="cursor-pointer text-sm font-medium">Orçamento por categoria <span className="text-xs text-muted-foreground">· {fmt(catSum, currency)} distribuídos</span></summary>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((c) => (
              <div key={c} className="grid gap-1.5"><Label className="text-xs text-muted-foreground">{c}</Label>
                <MoneyInput aria-label={`Orçamento ${c}`} value={cat[c] ?? null} onChange={(v) => setCat((s) => ({ ...s, [c]: v ?? 0 }))} /></div>
            ))}
          </div>
          {budget != null && catSum > budget && <p className="mt-3 text-xs text-destructive">A soma por categoria ultrapassa o orçamento coletivo.</p>}
        </details>

        <details className="rounded-xl border p-4" open={!!trip && Object.keys(ind).length > 0}>
          <summary className="cursor-pointer text-sm font-medium">Orçamento individual</summary>
          <p className="mt-2 text-xs text-muted-foreground">Limite que cada pessoa pretende gastar (sua parte nas despesas).</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {ids.map((id) => (
              <div key={id} className="grid gap-1.5"><Label className="text-xs text-muted-foreground">{participants.find((p) => p.id === id)?.name}</Label>
                <MoneyInput aria-label={`Orçamento individual ${id}`} value={ind[id] ?? null} onChange={(v) => setInd((s) => ({ ...s, [id]: v ?? 0 }))} /></div>
            ))}
          </div>
        </details>

        <DialogFooter><Button type="submit" className="w-full sm:w-auto">{trip ? "Salvar alterações" : "Criar viagem"}</Button></DialogFooter>
      </form>
    </>
  );
}

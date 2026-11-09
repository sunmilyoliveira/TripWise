import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveExpense, useAppState } from "@/lib/store";
import { computeShares } from "@/lib/finance";
import { fmt } from "@/lib/money";
import { todayISO } from "@/lib/finance";
import { CATEGORIES, ME, PAYMENT_METHODS, SPLIT_MODES, type Category, type Expense, type SplitMode } from "@/lib/types";
import { MoneyInput } from "./MoneyInput";
import { Chip, NativeSelect } from "./ui";
import { cn } from "@/lib/utils";

export function ExpenseDialog({ children, expense, tripId }: { children: ReactNode; expense?: Expense | undefined; tripId?: string | undefined }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        {open && <ExpenseForm expense={expense} tripId={tripId} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function ExpenseForm({ expense, tripId: initialTrip, onDone }: { expense?: Expense | undefined; tripId?: string | undefined; onDone: () => void }) {
  const trips = useAppState((s) => s.trips);
  const people = useAppState((s) => s.participants);
  const [tripId, setTripId] = useState(expense?.tripId ?? initialTrip ?? trips[0]?.id ?? "");
  const trip = trips.find((t) => t.id === tripId);
  const members = people.filter((p) => trip?.participantIds.includes(p.id));
  const [description, setDescription] = useState(expense?.description ?? "");
  const [amount, setAmount] = useState<number | null>(expense?.amount ?? null);
  const [date, setDate] = useState(expense?.date ?? todayISO());
  const [category, setCategory] = useState<Category>(expense?.category ?? "Alimentação");
  const [paidBy, setPaidBy] = useState(expense?.paidBy ?? ME);
  const [mode, setMode] = useState<SplitMode>(expense?.splitMode ?? "igual");
  const [ids, setIds] = useState<string[]>(expense?.participantIds ?? trip?.participantIds ?? [ME]);
  const [values, setValues] = useState<Record<string, number>>(expense?.customValues ?? {});
  const [pcts, setPcts] = useState<Record<string, number>>(expense?.percentages ?? {});
  const [method, setMethod] = useState(expense?.paymentMethod ?? "Pix");
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const cur = trip?.currency ?? "BRL";

  const changeTrip = (id: string) => {
    setTripId(id);
    const t = trips.find((x) => x.id === id);
    if (t) { setIds(t.participantIds); if (!t.participantIds.includes(paidBy)) setPaidBy(ME); }
  };
  const toggle = (id: string) => {
    if (mode === "individual") return setIds([id]);
    setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const setModeSafe = (m: SplitMode) => { setMode(m); if (m === "individual") setIds([ids[0] ?? paidBy]); };

  const preview = useMemo(() => computeShares({ amount: amount ?? 0, mode, participantIds: ids, customValues: values, percentages: pcts }), [amount, mode, ids, values, pcts]);
  const sumValues = ids.reduce((a, id) => a + (values[id] ?? 0), 0);
  const sumPcts = ids.reduce((a, id) => a + (pcts[id] ?? 0), 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount == null) { toast.error("Informe um valor válido (não negativo)."); return; }
    const r = saveExpense({ tripId, description, amount, date, category, paidBy, splitMode: mode, participantIds: ids,
      customValues: Object.fromEntries(ids.map((i) => [i, values[i] ?? 0])), percentages: Object.fromEntries(ids.map((i) => [i, pcts[i] ?? 0])), paymentMethod: method, notes }, expense?.id);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(expense ? "Despesa atualizada" : "Despesa registrada");
    onDone();
  };

  if (!trips.length) return <p className="text-sm text-muted-foreground">Crie uma viagem antes de registrar despesas.</p>;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display text-navy">{expense ? "Editar despesa" : "Nova despesa"}</DialogTitle>
        <DialogDescription>Os totais, saldos e relatórios são atualizados ao salvar.</DialogDescription>
      </DialogHeader>
      <form className="grid gap-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2 sm:col-span-2"><Label htmlFor="x-desc">Descrição</Label><Input id="x-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Jantar no centro" /></div>
          <div className="grid gap-2"><Label htmlFor="x-amount">Valor ({cur})</Label><MoneyInput id="x-amount" value={amount} onChange={setAmount} /></div>
          <div className="grid gap-2"><Label htmlFor="x-date">Data</Label><Input id="x-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="x-trip">Viagem</Label>
            <NativeSelect id="x-trip" value={tripId} onChange={(e) => changeTrip(e.target.value)}>{trips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</NativeSelect></div>
          <div className="grid gap-2"><Label htmlFor="x-cat">Categoria</Label>
            <NativeSelect id="x-cat" value={category} onChange={(e) => setCategory(e.target.value as Category)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</NativeSelect></div>
          <div className="grid gap-2"><Label htmlFor="x-paid">Quem pagou</Label>
            <NativeSelect id="x-paid" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>{members.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</NativeSelect></div>
          <div className="grid gap-2"><Label htmlFor="x-method">Forma de pagamento</Label>
            <NativeSelect id="x-method" value={method} onChange={(e) => setMethod(e.target.value)}>{PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}</NativeSelect></div>
        </div>

        <fieldset className="rounded-xl border p-4">
          <legend className="px-1 text-sm font-medium">Divisão</legend>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 sm:grid-cols-4">
            {(Object.keys(SPLIT_MODES) as SplitMode[]).map((m) => (
              <button type="button" key={m} onClick={() => setModeSafe(m)} className={cn("rounded-lg px-2 py-1.5 text-xs font-medium", mode === m ? "bg-card text-navy shadow-soft" : "text-muted-foreground")}>{SPLIT_MODES[m]}</button>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">{mode === "individual" ? "Quem é responsável por esta despesa?" : "Quem participa da divisão?"}</div>
          <div className="mt-2 flex flex-wrap gap-2">{members.map((p) => <Chip key={p.id} active={ids.includes(p.id)} onClick={() => toggle(p.id)}>{p.name}</Chip>)}</div>

          <ul className="mt-4 divide-y rounded-xl border">
            {ids.map((id) => {
              const p = people.find((x) => x.id === id);
              return (
                <li key={id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 truncate">{p?.name}</span>
                  <div className="flex items-center gap-2">
                    {mode === "valores" && <div className="w-28"><MoneyInput aria-label={`Valor de ${p?.name}`} value={values[id] ?? null} onChange={(v) => setValues((s) => ({ ...s, [id]: v ?? 0 }))} /></div>}
                    {mode === "porcentagem" && <div className="flex w-24 items-center gap-1"><Input aria-label={`Percentual de ${p?.name}`} inputMode="decimal" defaultValue={pcts[id] ? String(pcts[id]! / 100).replace(".", ",") : ""}
                      onChange={(e) => { const n = Number(e.target.value.replace(",", ".")); setPcts((s) => ({ ...s, [id]: Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : -1 })); }} /><span className="text-xs">%</span></div>}
                    <span className="w-24 text-right font-semibold text-navy tabular">{preview.ok ? fmt(preview.shares[id] ?? 0, cur) : "—"}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          {mode === "valores" && <p className="mt-2 text-xs text-muted-foreground tabular">Soma: {fmt(sumValues, cur)} de {fmt(amount ?? 0, cur)}</p>}
          {mode === "porcentagem" && <p className="mt-2 text-xs text-muted-foreground tabular">Soma: {(sumPcts / 100).toLocaleString("pt-BR")}% de 100%</p>}
          <div className={cn("mt-3 flex items-center gap-2 rounded-lg p-2.5 text-xs", preview.ok ? "bg-positive-soft text-positive" : "bg-destructive/10 text-destructive")}>
            {preview.ok ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
            {preview.ok ? `Divisão válida. ${people.find((p) => p.id === paidBy)?.name} recebe ${fmt((amount ?? 0) - (preview.shares[paidBy] ?? 0), cur)} dos demais.` : preview.error}
          </div>
        </fieldset>

        <div className="grid gap-2"><Label htmlFor="x-notes">Observações</Label><Textarea id="x-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} /></div>
        <DialogFooter><Button type="submit" className="w-full sm:w-auto" disabled={!preview.ok}>{expense ? "Salvar alterações" : "Registrar despesa"}</Button></DialogFooter>
      </form>
    </>
  );
}

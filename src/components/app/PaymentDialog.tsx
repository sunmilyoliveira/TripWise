import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nameOf, registerPayment } from "@/lib/store";
import { fmt } from "@/lib/money";
import { todayISO } from "@/lib/finance";
import type { Currency } from "@/lib/types";
import { MoneyInput } from "./MoneyInput";

export function PaymentDialog({ children, tripId, from, to, owed, currency }: { children: ReactNode; tripId: string; from: string; to: string; owed: number; currency: Currency }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number | null>(owed);
  const [date, setDate] = useState(todayISO());
  const [note, setNote] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount == null) { toast.error("Informe um valor válido."); return; }
    const r = registerPayment({ tripId, from, to, amount, date, note }, owed);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(amount === owed ? "Dívida quitada" : `Pagamento parcial registrado. Restam ${fmt(owed - amount, currency)}`);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setAmount(owed); setDate(todayISO()); setNote(""); } }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">Registrar pagamento</DialogTitle>
          <DialogDescription>{nameOf(from)} → {nameOf(to)} · pendente {fmt(owed, currency)}. Nenhum dinheiro é movimentado: apenas registramos o acerto.</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant={amount === owed ? "default" : "outline"} onClick={() => setAmount(owed)}>Valor total</Button>
            <Button type="button" size="sm" variant={amount !== owed ? "default" : "outline"} onClick={() => setAmount(null)}>Parcial</Button>
          </div>
          <div className="grid gap-2"><Label htmlFor="p-amount">Valor</Label><MoneyInput id="p-amount" value={amount} onChange={setAmount} /></div>
          <div className="grid gap-2"><Label htmlFor="p-date">Data</Label><Input id="p-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="p-note">Observação</Label><Input id="p-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: Pix" /></div>
          <DialogFooter><Button type="submit" className="w-full sm:w-auto">Registrar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

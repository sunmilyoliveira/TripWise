import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { participants } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function NewTripDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(["ana"]);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">Nova viagem</DialogTitle>
          <DialogDescription>Defina destino, datas e orçamento. (Demonstração — nada é salvo.)</DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); setOpen(false); toast.success("Viagem criada (demonstração)"); }}>
          <div className="grid gap-2"><Label htmlFor="t-name">Nome da viagem</Label><Input id="t-name" placeholder="Ex.: Férias em Lisboa" required /></div>
          <div className="grid gap-2"><Label htmlFor="t-dest">Destino</Label><Input id="t-dest" placeholder="Cidade, país" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label htmlFor="t-start">Ida</Label><Input id="t-start" type="date" /></div>
            <div className="grid gap-2"><Label htmlFor="t-end">Volta</Label><Input id="t-end" type="date" /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="t-budget">Orçamento previsto (R$)</Label><Input id="t-budget" type="number" min={0} placeholder="10.000" /></div>
          <div className="grid gap-2">
            <Label>Participantes</Label>
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <button type="button" key={p.id} onClick={() => setSelected((s) => on ? s.filter((x) => x !== p.id) : [...s, p.id])}
                    className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", on ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground")}>
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
          <DialogFooter><Button type="submit" className="w-full sm:w-auto">Criar viagem</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

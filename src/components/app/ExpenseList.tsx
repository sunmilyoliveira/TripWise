import { Pencil, Trash2, BedDouble, Car, UtensilsCrossed, Ticket, ShoppingBag, PlaneTakeoff, Package, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteExpense, useAppState } from "@/lib/store";
import { fmt } from "@/lib/money";
import { fmtDate } from "@/lib/dates";
import { SPLIT_MODES, type Category, type Expense } from "@/lib/types";
import { ExpenseDialog } from "./ExpenseDialog";
import { ConfirmDelete } from "./ConfirmDelete";
import { Avatar, EmptyState, Panel } from "./ui";

export const categoryIcon: Record<Category, typeof Car> = { Hospedagem: BedDouble, Transporte: Car, Alimentação: UtensilsCrossed, Passeios: Ticket, Compras: ShoppingBag, Passagens: PlaneTakeoff, Outros: Package };

export function ExpenseList({ expenses, showTrip = false }: { expenses: Expense[]; showTrip?: boolean }) {
  const trips = useAppState((s) => s.trips);
  const people = useAppState((s) => s.participants);
  const name = (id: string) => people.find((p) => p.id === id)?.name ?? "Removido";
  if (!expenses.length) return <EmptyState icon={Receipt} title="Nenhuma despesa" text="Registre a primeira despesa para atualizar totais e saldos." action={<ExpenseDialog><Button>Nova despesa</Button></ExpenseDialog>} />;
  return (
    <Panel className="p-0 sm:p-0">
      <ul className="divide-y">
        {[...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((e) => {
          const Icon = categoryIcon[e.category];
          const t = trips.find((x) => x.id === e.tripId);
          return (
            <li key={e.id} className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-navy">{e.description}</div>
                <div className="truncate text-xs text-muted-foreground">{e.category}{showTrip && t ? ` · ${t.name}` : ""} · {fmtDate(e.date)} · {SPLIT_MODES[e.splitMode]} · {e.paymentMethod}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground sm:hidden"><Avatar id={e.paidBy} size="sm" />{name(e.paidBy)} pagou</div>
              </div>
              <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><Avatar id={e.paidBy} size="sm" />{name(e.paidBy)} pagou</div>
              <div className="text-right font-semibold text-navy tabular">{fmt(e.amount, t?.currency)}</div>
              <div className="flex">
                <ExpenseDialog expense={e}><Button size="icon" variant="ghost" aria-label="Editar despesa"><Pencil /></Button></ExpenseDialog>
                <ConfirmDelete title="Excluir despesa?" text={`"${e.description}" será removida e os saldos recalculados.`} onConfirm={() => { const r = deleteExpense(e.id); r.ok ? toast.success("Despesa excluída") : toast.error(r.error); }}>
                  <Button size="icon" variant="ghost" aria-label="Excluir despesa"><Trash2 /></Button>
                </ConfirmDelete>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

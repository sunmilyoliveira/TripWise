import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Wallet, Receipt, PiggyBank, Scale, Link2, Copy, Ban, Mail, X, ShieldAlert, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, Panel, StatCard, ProgressBar, BudgetAlert, Avatar, NativeSelect, EmptyState } from "@/components/app/ui";
import { TripDialog } from "@/components/app/TripDialog";
import { ExpenseDialog } from "@/components/app/ExpenseDialog";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { ExpenseList } from "@/components/app/ExpenseList";
import { addInvite, createShareLink, deleteTrip, removeInvite, revokeShareLink, setRole, useAppState } from "@/lib/store";
import { budgetLevel, byCategory, byParticipant, pctOf, sumAmount, tripBalances, tripExpenses, tripPhase } from "@/lib/finance";
import { fmt } from "@/lib/money";
import { fmtDateLong } from "@/lib/dates";
import { CATEGORIES, ME, type Role } from "@/lib/types";

export const Route = createFileRoute("/viagens/$tripId")({
  head: () => ({ meta: [
    { title: "Resumo da viagem — TripWise" },
    { name: "description", content: "Orçamento, planejamento por categoria, participantes e compartilhamento da viagem." },
    { property: "og:title", content: "Resumo da viagem — TripWise" },
    { property: "og:description", content: "Orçamento, planejamento por categoria, participantes e compartilhamento da viagem." },
  ] }),
  component: TripDetail,
});

const ROLE_LABEL: Record<Role, string> = { organizador: "Organizador", editor: "Pode editar", leitor: "Somente leitura" };

function TripDetail() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const s = useAppState((x) => x);
  const trip = s.trips.find((t) => t.id === tripId);
  const [email, setEmail] = useState("");
  const [role, setRoleNew] = useState<Role>("leitor");
  if (!trip) return <EmptyState icon={ShieldAlert} title="Viagem não encontrada" text="Ela pode ter sido excluída." action={<Button asChild><Link to="/viagens">Voltar para viagens</Link></Button>} />;

  const c = trip.currency, th = s.settings.alertThreshold;
  const exps = tripExpenses(s, trip.id);
  const spent = sumAmount(exps);
  const cats = new Map(byCategory(exps).map((x) => [x.name, x.value]));
  const { consumed } = byParticipant(exps);
  const myBal = tripBalances(s, trip)[ME] ?? 0;
  const link = trip.shareLink && typeof window !== "undefined" ? `${window.location.origin}/compartilhado/${trip.shareLink.token}` : "";

  return (
    <>
      <Link to="/viagens" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Minhas viagens</Link>
      <PageHeader eyebrow={`${trip.destination} · ${tripPhase(trip)}`} title={trip.name} description={`${fmtDateLong(trip.start)} a ${fmtDateLong(trip.end)} · ${trip.participantIds.length} participantes · ${c}`}
        action={<>
          <ExpenseDialog tripId={trip.id}><Button><Plus />Despesa</Button></ExpenseDialog>
          <TripDialog trip={trip}><Button variant="outline"><Pencil />Editar</Button></TripDialog>
          <ConfirmDelete title="Excluir viagem?" text="Todas as despesas e pagamentos desta viagem também serão excluídos." onConfirm={() => { deleteTrip(trip.id); toast.success("Viagem excluída"); navigate({ to: "/viagens" }); }}>
            <Button variant="outline" aria-label="Excluir viagem"><Trash2 /></Button>
          </ConfirmDelete>
        </>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard tone="navy" label="Orçamento coletivo" value={fmt(trip.budget, c)} icon={Wallet} />
        <StatCard label="Gasto" value={fmt(spent, c)} icon={Receipt} hint={`${pctOf(spent, trip.budget)}% do orçamento`} />
        <StatCard tone={trip.budget - spent < 0 ? "negative" : "default"} label="Disponível" value={fmt(trip.budget - spent, c)} icon={PiggyBank} />
        <StatCard tone={myBal >= 0 ? "positive" : "negative"} label="Seu saldo" value={fmt(Math.abs(myBal), c)} icon={Scale} hint={myBal > 0 ? "a receber" : myBal < 0 ? "a pagar" : "quitado"} />
      </div>
      {s.settings.budgetAlerts && <div className="mt-3"><BudgetAlert level={budgetLevel(spent, trip.budget, th)} label={`${fmt(spent, c)} de ${fmt(trip.budget, c)}`} /></div>}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Planejado vs. realizado por categoria">
          <ul className="space-y-4">
            {CATEGORIES.filter((k) => (trip.categoryBudgets[k] ?? 0) > 0 || cats.has(k)).map((k) => {
              const plan = trip.categoryBudgets[k] ?? 0, real = cats.get(k) ?? 0, lv = budgetLevel(real, plan, th);
              return (
                <li key={k} className="space-y-1.5">
                  <div className="flex justify-between gap-2 text-sm"><span className="font-medium">{k}</span><span className="text-xs text-muted-foreground tabular">{fmt(real, c)} / {plan ? fmt(plan, c) : "sem limite"}</span></div>
                  <ProgressBar value={plan ? pctOf(real, plan) : 0} level={plan ? lv : "ok"} />
                  {plan > 0 && s.settings.budgetAlerts && <BudgetAlert level={lv} label={k} />}
                </li>
              );
            })}
            {!Object.keys(trip.categoryBudgets).length && !exps.length && <p className="text-sm text-muted-foreground">Defina limites por categoria em Editar.</p>}
          </ul>
        </Panel>
        <Panel title="Gastos individuais">
          <ul className="space-y-4">
            {trip.participantIds.map((id) => {
              const plan = trip.individualBudgets[id] ?? 0, real = consumed[id] ?? 0, lv = budgetLevel(real, plan, th);
              return (
                <li key={id} className="flex items-center gap-3">
                  <Avatar id={id} />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between gap-2 text-sm"><span className="font-medium">{s.participants.find((p) => p.id === id)?.name}</span><span className="text-xs text-muted-foreground tabular">{fmt(real, c)}{plan ? ` / ${fmt(plan, c)}` : ""}</span></div>
                    <ProgressBar value={plan ? pctOf(real, plan) : 0} level={plan ? lv : "ok"} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Participantes e permissões">
          <ul className="divide-y">
            {trip.participantIds.map((id) => (
              <li key={id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="flex items-center gap-3 text-sm"><Avatar id={id} size="sm" />{s.participants.find((p) => p.id === id)?.name}</span>
                {id === ME ? <span className="text-xs text-muted-foreground">Organizador</span> :
                  <NativeSelect aria-label="Permissão" className="w-40" value={trip.roles[id] ?? "editor"} onChange={(e) => { const r = setRole(trip.id, id, e.target.value as Role); if (!r.ok) toast.error(r.error); else toast.success("Permissão atualizada"); }}>
                    <option value="editor">{ROLE_LABEL.editor}</option><option value="leitor">{ROLE_LABEL.leitor}</option>
                  </NativeSelect>}
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t pt-5">
            <div className="mb-2 text-sm font-medium">Convidar por e-mail</div>
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); const r = addInvite(trip.id, email, role); if (!r.ok) return toast.error(r.error); setEmail(""); toast.success("Convite registrado"); }}>
              <Input type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="E-mail do convidado" />
              <NativeSelect aria-label="Permissão do convite" className="sm:w-40" value={role} onChange={(e) => setRoleNew(e.target.value as Role)}><option value="editor">{ROLE_LABEL.editor}</option><option value="leitor">{ROLE_LABEL.leitor}</option></NativeSelect>
              <Button type="submit" variant="outline"><Mail />Convidar</Button>
            </form>
            {trip.invites.length > 0 && <ul className="mt-3 space-y-2">{trip.invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs"><span>{i.email} · {ROLE_LABEL[i.role]} · <span className="text-warning">aguardando envio</span></span>
                <button aria-label="Cancelar convite" onClick={() => removeInvite(trip.id, i.id)}><X className="size-4" /></button></li>))}</ul>}
            <p className="mt-3 text-xs text-muted-foreground">O envio de e-mails e o controle de acesso por conta exigem ativar login e backend. Por enquanto o convite fica registrado aqui.</p>
          </div>
        </Panel>

        <Panel title="Link compartilhável">
          {trip.shareLink?.active ? (
            <>
              <div className="flex gap-2"><Input readOnly value={link} aria-label="Link" /><Button variant="outline" aria-label="Copiar link" onClick={() => { void navigator.clipboard?.writeText(link); toast.success("Link copiado"); }}><Copy /></Button></div>
              <Button variant="outline" className="mt-3 text-destructive" onClick={() => { revokeShareLink(trip.id); toast.success("Acesso ao link revogado"); }}><Ban />Revogar acesso</Button>
            </>
          ) : (
            <>
              {trip.shareLink && <p className="mb-3 text-xs text-destructive">O link anterior foi revogado e não abre mais.</p>}
              <Button onClick={() => { createShareLink(trip.id); toast.success("Link criado"); }}><Link2 />Gerar link somente leitura</Button>
            </>
          )}
          <div className="mt-5 flex gap-2 rounded-xl bg-warning-soft p-3 text-xs text-warning">
            <ShieldAlert className="size-4 shrink-0" />
            <span>Como os dados ainda ficam só neste navegador, o link abre apenas neste dispositivo. Para que outras pessoas acessem com segurança, é preciso ativar o backend com login.</span>
          </div>
        </Panel>
      </div>

      <h2 className="mb-4 mt-8 text-lg font-semibold text-navy">Despesas da viagem</h2>
      <ExpenseList expenses={exps} />
    </>
  );
}

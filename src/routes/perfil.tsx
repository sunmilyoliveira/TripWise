import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, LogOut, RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Panel, Avatar, NativeSelect } from "@/components/app/ui";
import { ConfirmDelete } from "@/components/app/ConfirmDelete";
import { getState, resetAll, updateProfile, updateSettings, useAppState } from "@/lib/store";
import { CURRENCIES, ME, type Currency, type Settings } from "@/lib/types";
import { fmtDateTime } from "@/lib/dates";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [
    { title: "Perfil e configurações — TripWise" },
    { name: "description", content: "Edite seu perfil, moeda padrão, alertas de orçamento e privacidade." },
    { property: "og:title", content: "Perfil e configurações — TripWise" },
    { property: "og:description", content: "Edite seu perfil, moeda padrão, alertas de orçamento e privacidade." },
  ] }),
  component: Profile,
});

const toggles: { key: keyof Pick<Settings, "budgetAlerts" | "settleReminders" | "weeklySummary">; label: string; desc: string }[] = [
  { key: "budgetAlerts", label: "Alertas de orçamento", desc: "Mostrar avisos quando uma viagem ou categoria chegar perto do limite" },
  { key: "settleReminders", label: "Lembretes de acerto", desc: "Destacar dívidas pendentes (envio a terceiros requer backend)" },
  { key: "weeklySummary", label: "Resumo semanal por e-mail", desc: "Requer backend para envio de e-mails" },
];

function Profile() {
  const s = useAppState((x) => x);
  const [name, setName] = useState(s.profile.name);
  const [email, setEmail] = useState(s.profile.email);
  const set = (p: Partial<Settings>) => { const r = updateSettings(p); r.ok ? toast.success("Preferência salva") : toast.error(r.error); };
  const exportData = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "tripwise-dados.json"; a.click();
  };
  return (
    <>
      <PageHeader eyebrow="Conta" title="Perfil e configurações" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="text-center">
          <div className="mx-auto w-fit scale-150 py-4"><Avatar id={ME} /></div>
          <div className="mt-4 font-display text-lg font-semibold text-navy">{s.profile.name}</div>
          <div className="text-sm text-muted-foreground">{s.profile.email || "Sem e-mail"}</div>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-5 text-xs text-muted-foreground">
            <div><div className="font-display text-lg font-semibold text-navy">{s.trips.length}</div>viagens</div>
            <div><div className="font-display text-lg font-semibold text-navy">{s.participants.length - 1}</div>pessoas</div>
            <div><div className="font-display text-lg font-semibold text-navy">{s.expenses.length}</div>despesas</div>
          </div>
        </Panel>
        <Panel title="Dados pessoais" className="lg:col-span-2">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); const r = updateProfile(name, email); r.ok ? toast.success("Perfil atualizado") : toast.error(r.error); }}>
            <div className="grid gap-2"><Label htmlFor="n">Nome</Label><Input id="n" value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="e">E-mail</Label><Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="c">Moeda padrão</Label>
              <NativeSelect id="c" value={s.settings.currency} onChange={(e) => set({ currency: e.target.value as Currency })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</NativeSelect></div>
            <div className="grid gap-2"><Label htmlFor="th">Alertar ao atingir (%) do orçamento</Label>
              <Input id="th" type="number" min={1} max={100} defaultValue={s.settings.alertThreshold} onBlur={(e) => set({ alertThreshold: Number(e.target.value) })} /></div>
            <div className="sm:col-span-2"><Button type="submit">Salvar perfil</Button></div>
          </form>
        </Panel>
        <Panel title="Preferências" className="lg:col-span-2">
          <ul className="divide-y">
            {toggles.map((p) => (
              <li key={p.key} className="flex items-center justify-between gap-4 py-3">
                <div><div className="text-sm font-medium text-navy">{p.label}</div><div className="text-xs text-muted-foreground">{p.desc}</div></div>
                <Switch checked={s.settings[p.key]} onCheckedChange={(v) => set({ [p.key]: v })} aria-label={p.label} />
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Privacidade e dados">
          <div className="flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-primary" />Seus dados ficam apenas neste navegador. Nada é enviado a servidores. Limpar o navegador apaga tudo — exporte um backup.</div>
          <div className="mt-4 grid gap-2">
            <Button variant="outline" onClick={exportData}><Download />Exportar meus dados</Button>
            <ConfirmDelete title="Apagar todos os dados?" text="Viagens, despesas, pagamentos e participantes serão removidos deste dispositivo." onConfirm={() => { resetAll(); toast.success("Dados apagados"); }}>
              <Button variant="outline" className="text-destructive"><RotateCcw />Apagar todos os dados</Button>
            </ConfirmDelete>
            <Button variant="ghost" disabled title="Login ainda não ativado"><LogOut />Sair da conta (requer login)</Button>
          </div>
        </Panel>
        <Panel title="Histórico de alterações" className="lg:col-span-3">
          {!s.log.length ? <p className="text-sm text-muted-foreground">Nenhuma alteração registrada.</p> :
          <ul className="max-h-80 divide-y overflow-y-auto">
            {s.log.slice(0, 100).map((l) => <li key={l.id} className="flex justify-between gap-3 py-2 text-xs"><span><strong className="text-navy">{l.action}</strong> · {l.detail}</span><span className="shrink-0 text-muted-foreground">{fmtDateTime(l.at)}</span></li>)}
          </ul>}
        </Panel>
      </div>
    </>
  );
}

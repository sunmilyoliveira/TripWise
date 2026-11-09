import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Panel, Avatar, DemoBadge } from "@/components/app/ui";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [
    { title: "Perfil e configurações — TripWise" },
    { name: "description", content: "Gerencie seus dados, moeda padrão e preferências de notificação." },
    { property: "og:title", content: "Perfil e configurações — TripWise" },
    { property: "og:description", content: "Gerencie seus dados, moeda padrão e preferências de notificação." },
  ] }),
  component: Profile,
});

const prefs = [
  { id: "n1", label: "Alertas de orçamento", desc: "Aviso ao atingir 80% do orçamento", on: true },
  { id: "n2", label: "Lembretes de acerto", desc: "Lembrar participantes de pagamentos pendentes", on: true },
  { id: "n3", label: "Resumo semanal", desc: "E-mail com o resumo das viagens", on: false },
];

function Profile() {
  return (
    <>
      <PageHeader eyebrow="Conta" title="Perfil e configurações" action={<DemoBadge />} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="text-center">
          <div className="mx-auto w-fit scale-150 py-4"><Avatar id="ana" /></div>
          <div className="mt-4 font-display text-lg font-semibold text-navy">Ana Souza</div>
          <div className="text-sm text-muted-foreground">ana.souza@exemplo.com</div>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t pt-5 text-xs text-muted-foreground">
            <div><div className="font-display text-lg font-semibold text-navy">3</div>viagens</div>
            <div><div className="font-display text-lg font-semibold text-navy">4</div>amigos</div>
            <div><div className="font-display text-lg font-semibold text-navy">8</div>despesas</div>
          </div>
        </Panel>
        <Panel title="Dados pessoais" className="lg:col-span-2">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); toast.success("Preferências salvas (demonstração)"); }}>
            <div className="grid gap-2"><Label htmlFor="n">Nome</Label><Input id="n" defaultValue="Ana Souza" /></div>
            <div className="grid gap-2"><Label htmlFor="e">E-mail</Label><Input id="e" type="email" defaultValue="ana.souza@exemplo.com" /></div>
            <div className="grid gap-2"><Label htmlFor="c">Moeda padrão</Label><Input id="c" defaultValue="Real brasileiro (BRL)" readOnly /></div>
            <div className="grid gap-2"><Label htmlFor="l">Idioma</Label><Input id="l" defaultValue="Português (Brasil)" readOnly /></div>
            <div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div>
          </form>
        </Panel>
        <Panel title="Notificações" className="lg:col-span-3">
          <ul className="divide-y">
            {prefs.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <div><div className="text-sm font-medium text-navy">{p.label}</div><div className="text-xs text-muted-foreground">{p.desc}</div></div>
                <Switch defaultChecked={p.on} aria-label={p.label} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

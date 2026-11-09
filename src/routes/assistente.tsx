import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles, Send, TrendingDown, PiggyBank, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, DemoBadge } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistente")({
  head: () => ({ meta: [
    { title: "Assistente IA — TripWise" },
    { name: "description", content: "Pergunte ao assistente financeiro sobre orçamento, gastos e economia nas suas viagens." },
    { property: "og:title", content: "Assistente IA — TripWise" },
    { property: "og:description", content: "Pergunte ao assistente financeiro sobre orçamento, gastos e economia nas suas viagens." },
  ] }),
  component: Assistant,
});

type Msg = { role: "user" | "ai"; text: string };
const suggestions = ["Quanto ainda posso gastar em Paris?", "Qual categoria pesa mais no orçamento?", "Como economizar em Buenos Aires?"];
const insights = [
  { icon: TrendingDown, title: "Hospedagem acima da média", text: "Em Paris, 34% do orçamento vai para hotel. A média de viagens similares é 28%." },
  { icon: PiggyBank, title: "Economia possível", text: "Comprar o passeio de tango com antecedência pode economizar cerca de R$ 180." },
  { icon: AlertTriangle, title: "Atenção ao câmbio", text: "Reserve 8% extra no orçamento de Buenos Aires para variação cambial." },
];

function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "user", text: "Estou dentro do orçamento em Gramado?" },
    { role: "ai", text: "Sim! Você já usou 59% dos R$ 6.500 previstos, faltando 39 dias para a viagem. Restam R$ 2.660 — suficiente para alimentação e passeios no ritmo atual." },
  ]);
  const [input, setInput] = useState("");
  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: "Esta é uma resposta demonstrativa. Em breve o assistente analisará seus dados reais para responder a essa pergunta." }]);
    setInput("");
  };
  const submit = (e: FormEvent) => { e.preventDefault(); send(input); };

  return (
    <>
      <PageHeader eyebrow="Assistente IA" title="Seu copiloto financeiro" description="Perguntas sobre orçamento, gastos e economia em linguagem natural." action={<DemoBadge />} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="flex min-h-[520px] flex-col lg:col-span-2">
          <div className="flex-1 space-y-4">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                {m.role === "ai" && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>}
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "rounded-br-sm bg-navy text-navy-foreground" : "rounded-tl-sm bg-muted text-foreground")}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {suggestions.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">{s}</button>)}
          </div>
          <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-2xl border bg-background p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pergunte sobre suas viagens…" className="flex-1 bg-transparent px-2 text-sm outline-none" />
            <Button size="icon" type="submit" aria-label="Enviar"><Send /></Button>
          </form>
        </Panel>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-navy">Análises recentes</h2>
          {insights.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card-surface p-5">
              <span className="grid size-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-4" /></span>
              <div className="mt-3 text-sm font-semibold text-navy">{title}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

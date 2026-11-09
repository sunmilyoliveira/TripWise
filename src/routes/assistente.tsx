import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Sparkles, Send, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/app/ui";
import { TripPicker, useSelectedTrip } from "@/components/app/TripPicker";
import { getState } from "@/lib/store";
import { answer } from "@/lib/assistant";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistente")({
  head: () => ({ meta: [
    { title: "Assistente financeiro — TripWise" },
    { name: "description", content: "Pergunte sobre gastos, orçamento e dívidas das suas viagens com respostas calculadas dos seus dados." },
    { property: "og:title", content: "Assistente financeiro — TripWise" },
    { property: "og:description", content: "Pergunte sobre gastos, orçamento e dívidas das suas viagens com respostas calculadas dos seus dados." },
  ] }),
  component: Assistant,
});

type Msg = { role: "user" | "ai"; text: string };
const suggestions = ["Quanto já gastei nesta viagem?", "Quanto ainda posso gastar?", "Qual categoria está consumindo mais dinheiro?", "Quanto cada participante deve?", "Como podemos dividir melhor as despesas?", "Estou dentro do orçamento?", "Onde posso economizar?"];

function Assistant() {
  const { trip, setTripId, trips } = useSelectedTrip();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const send = (text: string) => {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: answer(text, getState(), trip) }]);
    setInput("");
  };
  const submit = (e: FormEvent) => { e.preventDefault(); send(input); };

  return (
    <>
      <PageHeader eyebrow="Assistente" title="Seu copiloto financeiro" description="Respostas calculadas a partir das despesas, orçamentos e pagamentos registrados."
        action={trips.length > 0 && trip && <TripPicker value={trip.id} onChange={setTripId} />} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="flex min-h-[520px] flex-col lg:col-span-2">
          <div className="flex-1 space-y-4">
            {!msgs.length && <p className="py-10 text-center text-sm text-muted-foreground">Escolha uma pergunta abaixo ou escreva a sua.</p>}
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" && "justify-end")}>
                {m.role === "ai" && <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>}
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "rounded-br-sm bg-navy text-navy-foreground" : "rounded-tl-sm bg-muted text-foreground")}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {suggestions.map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">{s}</button>)}
          </div>
          <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-2xl border bg-background p-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Pergunte sobre suas viagens…" aria-label="Pergunta" className="flex-1 bg-transparent px-2 text-sm outline-none" />
            <Button size="icon" type="submit" aria-label="Enviar"><Send /></Button>
          </form>
        </Panel>
        <div className="card-surface h-fit p-5">
          <span className="grid size-9 place-items-center rounded-xl bg-warning-soft text-warning"><Info className="size-4" /></span>
          <div className="mt-3 text-sm font-semibold text-navy">Como este assistente funciona</div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            As respostas são calculadas por regras a partir dos seus dados reais — não há IA generativa conectada ainda.
            Para conversas livres com IA, é preciso ativar o backend (Lovable Cloud), que dá acesso a modelos de IA sem expor chaves no navegador.
          </p>
        </div>
      </div>
    </>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addParticipant } from "@/lib/store";

export function AddParticipantInline({ onAdded }: { onAdded?: (id: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const submit = () => {
    const r = addParticipant(name, email);
    if (!r.ok) return toast.error(r.error);
    toast.success(`${r.value.name} adicionado(a)`);
    setName(""); setEmail(""); onAdded?.(r.value.id);
  };
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} aria-label="Nome do novo participante" />
      <Input placeholder="E-mail (opcional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="E-mail do novo participante" />
      <Button type="button" variant="outline" onClick={submit}><UserPlus />Adicionar</Button>
    </div>
  );
}

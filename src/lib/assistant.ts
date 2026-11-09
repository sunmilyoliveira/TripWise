import { budgetLevel, byCategory, byParticipant, pctOf, suggestTransfers, sumAmount, tripBalances, tripExpenses } from "./finance";
import { fmt } from "./money";
import type { AppState, Trip } from "./types";
import { ME } from "./types";

/**
 * Deterministic answers computed from the user's data. This is NOT a generative AI.
 * To plug a real model later, send `buildContext()` to a server function that calls the AI gateway.
 */
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const nm = (s: AppState, id: string) => s.participants.find((p) => p.id === id)?.name ?? "Removido";

export function answer(q: string, s: AppState, trip: Trip | undefined): string {
  if (!trip) return "Você ainda não tem viagens. Crie uma em “Minhas viagens” para que eu possa analisar seus gastos.";
  const t = norm(q), c = trip.currency;
  const exps = tripExpenses(s, trip.id), spent = sumAmount(exps), left = trip.budget - spent;
  const cats = byCategory(exps);
  const bal = tripBalances(s, trip);

  if (/(ainda posso|posso gastar|resta|sobra|disponivel)/.test(t))
    return trip.budget ? (left >= 0 ? `Em ${trip.name} ainda restam ${fmt(left, c)} do orçamento de ${fmt(trip.budget, c)} (${pctOf(spent, trip.budget)}% usado).` : `O orçamento de ${trip.name} foi ultrapassado em ${fmt(-left, c)}.`) : `${trip.name} não tem orçamento definido. Edite a viagem para definir um.`;
  if (/(dentro do orcamento|estou dentro|orcamento)/.test(t)) {
    const lv = budgetLevel(spent, trip.budget, s.settings.alertThreshold);
    const over = cats.filter((x) => (trip.categoryBudgets[x.name] ?? 0) > 0 && x.value > trip.categoryBudgets[x.name]!).map((x) => x.name);
    const base = !trip.budget ? "Não há orçamento definido para esta viagem." : lv === "ok" ? `Sim. Você usou ${pctOf(spent, trip.budget)}% do orçamento.` : lv === "alerta" ? `Quase no limite: ${pctOf(spent, trip.budget)}% usado.` : `Não. Os gastos passaram ${fmt(-left, c)} do orçamento.`;
    return over.length ? `${base} Categorias acima do limite: ${over.join(", ")}.` : base;
  }
  if (/(categoria|consumindo|mais dinheiro|maior gasto)/.test(t))
    return cats.length ? `A categoria que mais consome é ${cats[0]!.name}, com ${fmt(cats[0]!.value, c)} (${pctOf(cats[0]!.value, spent)}% do gasto). ${cats.slice(1, 3).map((x) => `${x.name}: ${fmt(x.value, c)}`).join("; ")}` : "Ainda não há despesas registradas nesta viagem.";
  if (/(cada participante|quem deve|deve|devendo)/.test(t)) {
    const tr = suggestTransfers(bal);
    return tr.length ? `Pendências em ${trip.name}: ${tr.map((x) => `${nm(s, x.from)} deve ${fmt(x.amount, c)} para ${nm(s, x.to)}`).join("; ")}.` : "Ninguém deve nada nesta viagem — tudo quitado.";
  }
  if (/(dividir melhor|divisao|dividir)/.test(t)) {
    const { paid } = byParticipant(exps);
    const top = Object.entries(paid).sort((a, b) => b[1] - a[1])[0];
    const tr = suggestTransfers(bal);
    return top ? `${nm(s, top[0])} adiantou mais (${fmt(top[1], c)}). Para equilibrar, alterne quem paga as próximas despesas ou quite com ${tr.length} transferência(s): ${tr.map((x) => `${nm(s, x.from)} → ${nm(s, x.to)} ${fmt(x.amount, c)}`).join("; ") || "nenhuma necessária"}.` : "Registre despesas para eu sugerir uma divisão.";
  }
  if (/(economizar|economia|cortar)/.test(t)) {
    const over = cats.map((x) => ({ ...x, plan: trip.categoryBudgets[x.name] ?? 0 })).filter((x) => x.plan && x.value > x.plan * 0.8);
    if (over.length) return `Atenção a: ${over.map((x) => `${x.name} (${fmt(x.value, c)} de ${fmt(x.plan, c)})`).join("; ")}. Reduzir essas categorias tem mais impacto.`;
    return cats.length ? `Sem categorias perto do limite. A maior é ${cats[0]!.name} (${pctOf(cats[0]!.value, spent)}%) — é onde uma economia faria mais diferença.` : "Ainda não há despesas para analisar.";
  }
  if (/(gastei|gasto|quanto)/.test(t)) {
    const mine = exps.reduce((a, e) => a + (e.shares[ME] ?? 0), 0);
    return `Em ${trip.name} o grupo gastou ${fmt(spent, c)} em ${exps.length} despesa(s). Sua parte é ${fmt(mine, c)}.`;
  }
  return "Ainda não sei responder isso. Tente: quanto já gastei, quanto ainda posso gastar, qual categoria consome mais, quanto cada participante deve, estou dentro do orçamento ou onde posso economizar.";
}

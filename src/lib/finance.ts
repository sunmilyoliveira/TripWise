import { distribute } from "./money";
import type { AppState, Category, Expense, SplitMode, Trip } from "./types";
import { ME } from "./types";

export type SplitInput = { amount: number; mode: SplitMode; participantIds: string[]; customValues: Record<string, number>; percentages: Record<string, number> };
export type SplitResult = { ok: true; shares: Record<string, number> } | { ok: false; error: string };

export function computeShares({ amount, mode, participantIds, customValues, percentages }: SplitInput): SplitResult {
  if (!Number.isInteger(amount) || amount <= 0) return { ok: false, error: "Informe um valor maior que zero." };
  const ids = [...new Set(participantIds)];
  if (ids.length === 0) return { ok: false, error: "Selecione ao menos um participante." };
  if (mode === "individual") {
    if (ids.length !== 1) return { ok: false, error: "Despesa individual deve ter exatamente uma pessoa." };
    return { ok: true, shares: { [ids[0]!]: amount } };
  }
  if (mode === "igual") {
    const parts = distribute(amount, ids.map(() => 1));
    return { ok: true, shares: Object.fromEntries(ids.map((id, i) => [id, parts[i]!])) };
  }
  if (mode === "valores") {
    const vals = ids.map((id) => customValues[id] ?? 0);
    if (vals.some((v) => !Number.isInteger(v) || v < 0)) return { ok: false, error: "Valores não podem ser negativos." };
    const sum = vals.reduce((a, b) => a + b, 0);
    if (sum !== amount) return { ok: false, error: `A soma dos valores (${(sum / 100).toFixed(2).replace(".", ",")}) difere do total (${(amount / 100).toFixed(2).replace(".", ",")}).` };
    return { ok: true, shares: Object.fromEntries(ids.map((id, i) => [id, vals[i]!])) };
  }
  const pcts = ids.map((id) => percentages[id] ?? 0);
  if (pcts.some((p) => p < 0)) return { ok: false, error: "Percentuais não podem ser negativos." };
  const sum = pcts.reduce((a, b) => a + b, 0);
  if (sum !== 10000) return { ok: false, error: `Os percentuais somam ${(sum / 100).toLocaleString("pt-BR")}%, devem somar 100%.` };
  const parts = distribute(amount, pcts);
  return { ok: true, shares: Object.fromEntries(ids.map((id, i) => [id, parts[i]!])) };
}

/** Net balance per participant for a trip. Positive = should receive; negative = owes. */
export function tripBalances(state: Pick<AppState, "expenses" | "payments">, trip: Pick<Trip, "id" | "participantIds">) {
  const b: Record<string, number> = Object.fromEntries(trip.participantIds.map((id) => [id, 0]));
  for (const e of state.expenses) {
    if (e.tripId !== trip.id) continue;
    b[e.paidBy] = (b[e.paidBy] ?? 0) + e.amount;
    for (const [id, v] of Object.entries(e.shares)) b[id] = (b[id] ?? 0) - v;
  }
  for (const p of state.payments) {
    if (p.tripId !== trip.id) continue;
    b[p.from] = (b[p.from] ?? 0) + p.amount;
    b[p.to] = (b[p.to] ?? 0) - p.amount;
  }
  return b;
}

/** Settlement transfers (greedy largest-first, at most n-1 payments). */
export function suggestTransfers(bal: Record<string, number>) {
  const debt = Object.entries(bal).filter(([, v]) => v < 0).map(([id, v]) => ({ id, v: -v })).sort((a, b) => b.v - a.v);
  const cred = Object.entries(bal).filter(([, v]) => v > 0).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  const out: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debt.length && j < cred.length) {
    const d = debt[i]!, c = cred[j]!;
    const amt = Math.min(d.v, c.v);
    if (amt > 0) out.push({ from: d.id, to: c.id, amount: amt });
    d.v -= amt; c.v -= amt;
    if (d.v === 0) i++;
    if (c.v === 0) j++;
  }
  return out;
}

export const tripExpenses = (s: Pick<AppState, "expenses">, tripId: string) => s.expenses.filter((e) => e.tripId === tripId);
export const sumAmount = (list: { amount: number }[]) => list.reduce((a, e) => a + e.amount, 0);

export function byCategory(list: Expense[]) {
  const m = new Map<Category, number>();
  for (const e of list) m.set(e.category, (m.get(e.category) ?? 0) + e.amount);
  return [...m].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

/** Consumption per participant (sum of shares) and amount paid upfront. */
export function byParticipant(list: Expense[]) {
  const consumed: Record<string, number> = {}, paid: Record<string, number> = {};
  for (const e of list) {
    paid[e.paidBy] = (paid[e.paidBy] ?? 0) + e.amount;
    for (const [id, v] of Object.entries(e.shares)) consumed[id] = (consumed[id] ?? 0) + v;
  }
  return { consumed, paid };
}

export type TripPhase = "Futura" | "Em andamento" | "Concluída";
export function tripPhase(t: Pick<Trip, "start" | "end">, today = todayISO()): TripPhase {
  if (today < t.start) return "Futura";
  if (today > t.end) return "Concluída";
  return "Em andamento";
}
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type BudgetLevel = "ok" | "alerta" | "excedido";
export function budgetLevel(spent: number, budget: number, threshold = 80): BudgetLevel {
  if (budget <= 0) return "ok";
  if (spent > budget) return "excedido";
  return spent * 100 >= budget * threshold ? "alerta" : "ok";
}
export const pctOf = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

/** User-level totals across trips in a given currency. */
export function userSummary(s: AppState, currency: string) {
  const trips = s.trips.filter((t) => t.currency === currency);
  let planned = 0, spent = 0, toReceive = 0, toPay = 0;
  for (const t of trips) {
    planned += t.budget;
    spent += sumAmount(tripExpenses(s, t.id));
    const me = tripBalances(s, t)[ME] ?? 0;
    if (me > 0) toReceive += me; else toPay -= me;
  }
  return { trips, planned, spent, available: planned - spent, toReceive, toPay, otherCurrency: s.trips.length - trips.length };
}

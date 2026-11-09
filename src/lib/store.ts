import { useSyncExternalStore } from "react";
import { computeShares } from "./finance";
import { fmt } from "./money";
import type { AppState, Category, Currency, Expense, Invite, Participant, Payment, Role, Settings, Trip } from "./types";
import { ME } from "./types";

/**
 * Local persistent store (localStorage). Every screen reads from here so all totals stay in sync.
 * Actions validate input and return { ok, error } so UI can show clear messages.
 * To migrate to a backend later, replace `persist`/`load` and the action bodies.
 */
const KEY = "tripwise:v1";
export const initialState = (): AppState => ({
  version: 1,
  profile: { name: "Você", email: "" },
  settings: { currency: "BRL", budgetAlerts: true, alertThreshold: 80, settleReminders: true, weeklySummary: false },
  participants: [{ id: ME, name: "Você", email: "" }],
  trips: [], expenses: [], payments: [], log: [],
});

let state: AppState = initialState();
let hydrated = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...initialState(), ...(JSON.parse(raw) as AppState) };
  } catch { /* corrupt storage -> keep initial */ }
  hydrated = true;
  emit();
}
function persist() {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(state));
}
export const getState = () => state;
/** Test helper. */
export function _setState(s: AppState) { state = s; hydrated = true; emit(); }

export function useAppState<T>(sel: (s: AppState) => T): T {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => sel(state), () => sel(initialState()));
}
export const useHydrated = () => useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => hydrated, () => false);

type Result<T = undefined> = { ok: true; value: T } | { ok: false; error: string };
const ok = <T,>(value: T): Result<T> => ({ ok: true, value });
const err = (error: string): Result<never> => ({ ok: false, error });
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2));
const now = () => new Date().toISOString();

function commit(next: AppState, action: string, detail: string) {
  state = { ...next, log: [{ id: uid(), at: now(), action, detail }, ...next.log].slice(0, 500) };
  persist(); emit();
}
export const nameOf = (id: string, s: AppState = state) => s.participants.find((p) => p.id === id)?.name ?? "Removido";

/* ---------- Participants ---------- */
export function addParticipant(name: string, email = ""): Result<Participant> {
  const n = name.trim();
  if (!n) return err("Informe o nome do participante.");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return err("E-mail inválido.");
  if (state.participants.some((p) => p.name.toLowerCase() === n.toLowerCase())) return err("Já existe um participante com esse nome.");
  const p = { id: uid(), name: n, email: email.trim() };
  commit({ ...state, participants: [...state.participants, p] }, "Participante adicionado", n);
  return ok(p);
}
export function removeParticipant(id: string): Result {
  if (id === ME) return err("Você não pode remover a si mesmo.");
  const used = state.expenses.some((e) => e.paidBy === id || id in e.shares) || state.payments.some((p) => p.from === id || p.to === id);
  if (used) return err("Esse participante possui despesas ou pagamentos registrados.");
  commit({ ...state, participants: state.participants.filter((p) => p.id !== id), trips: state.trips.map((t) => ({ ...t, participantIds: t.participantIds.filter((x) => x !== id) })) }, "Participante removido", nameOf(id));
  return ok(undefined);
}

/* ---------- Trips ---------- */
export type TripInput = { name: string; destination: string; start: string; end: string; currency: Currency; budget: number; participantIds: string[]; categoryBudgets: Partial<Record<Category, number>>; individualBudgets: Record<string, number> };
function validateTrip(t: TripInput): string | null {
  if (!t.name.trim()) return "Informe o nome da viagem.";
  if (!t.destination.trim()) return "Informe o destino.";
  if (!t.start || !t.end) return "Informe as datas de ida e volta.";
  if (t.end < t.start) return "A data de volta deve ser depois da ida.";
  if (!Number.isInteger(t.budget) || t.budget < 0) return "Orçamento inválido.";
  if (Object.values(t.categoryBudgets).some((v) => v! < 0) || Object.values(t.individualBudgets).some((v) => v < 0)) return "Orçamentos não podem ser negativos.";
  const cat = Object.values(t.categoryBudgets).reduce<number>((a, b) => a + (b ?? 0), 0);
  if (t.budget > 0 && cat > t.budget) return "A soma dos orçamentos por categoria ultrapassa o orçamento total.";
  return null;
}
export function saveTrip(input: TripInput, id?: string): Result<Trip> {
  const ids = [...new Set([ME, ...input.participantIds])];
  const e = validateTrip(input); if (e) return err(e);
  if (id) {
    const cur = state.trips.find((t) => t.id === id); if (!cur) return err("Viagem não encontrada.");
    const removed = cur.participantIds.filter((p) => !ids.includes(p));
    const blocked = removed.find((p) => state.expenses.some((x) => x.tripId === id && (x.paidBy === p || p in x.shares)));
    if (blocked) return err(`${nameOf(blocked)} tem despesas nesta viagem e não pode ser removido(a).`);
    const roles = Object.fromEntries(ids.map((p) => [p, cur.roles[p] ?? (p === ME ? "organizador" : "editor")])) as Record<string, Role>;
    const next = { ...cur, ...input, participantIds: ids, roles };
    commit({ ...state, trips: state.trips.map((t) => (t.id === id ? next : t)) }, "Viagem editada", next.name);
    return ok(next);
  }
  const trip: Trip = { id: uid(), ...input, participantIds: ids, roles: Object.fromEntries(ids.map((p) => [p, p === ME ? "organizador" : "editor"])), invites: [], shareLink: null, createdAt: now() };
  commit({ ...state, trips: [...state.trips, trip] }, "Viagem criada", trip.name);
  return ok(trip);
}
export function deleteTrip(id: string): Result {
  const t = state.trips.find((x) => x.id === id); if (!t) return err("Viagem não encontrada.");
  commit({ ...state, trips: state.trips.filter((x) => x.id !== id), expenses: state.expenses.filter((x) => x.tripId !== id), payments: state.payments.filter((x) => x.tripId !== id) }, "Viagem excluída", t.name);
  return ok(undefined);
}
function patchTrip(id: string, fn: (t: Trip) => Trip, action: string, detail: string) {
  commit({ ...state, trips: state.trips.map((t) => (t.id === id ? fn(t) : t)) }, action, detail);
}
export function setRole(tripId: string, pid: string, role: Role): Result {
  if (pid === ME) return err("O organizador não pode mudar a própria permissão.");
  patchTrip(tripId, (t) => ({ ...t, roles: { ...t.roles, [pid]: role } }), "Permissão alterada", `${nameOf(pid)}: ${role}`);
  return ok(undefined);
}
export function addInvite(tripId: string, email: string, role: Role): Result<Invite> {
  if (!/^\S+@\S+\.\S+$/.test(email)) return err("E-mail inválido.");
  const inv = { id: uid(), email: email.trim(), role, createdAt: now() };
  patchTrip(tripId, (t) => ({ ...t, invites: [...t.invites, inv] }), "Convite registrado", email);
  return ok(inv);
}
export function removeInvite(tripId: string, inviteId: string) {
  patchTrip(tripId, (t) => ({ ...t, invites: t.invites.filter((i) => i.id !== inviteId) }), "Convite cancelado", inviteId);
}
export function createShareLink(tripId: string) {
  patchTrip(tripId, (t) => ({ ...t, shareLink: { token: uid().replace(/-/g, ""), active: true, createdAt: now() } }), "Link criado", tripId);
}
export function revokeShareLink(tripId: string) {
  patchTrip(tripId, (t) => (t.shareLink ? { ...t, shareLink: { ...t.shareLink, active: false } } : t), "Link revogado", tripId);
}

/* ---------- Expenses ---------- */
export type ExpenseInput = Omit<Expense, "id" | "shares" | "createdAt">;
export function saveExpense(input: ExpenseInput, id?: string): Result<Expense> {
  const trip = state.trips.find((t) => t.id === input.tripId);
  if (!trip) return err("Selecione a viagem.");
  if (!input.description.trim()) return err("Informe a descrição.");
  if (!input.date) return err("Informe a data.");
  if (!trip.participantIds.includes(input.paidBy)) return err("Quem pagou precisa ser participante da viagem.");
  if (input.participantIds.some((p) => !trip.participantIds.includes(p))) return err("Participantes inválidos para esta viagem.");
  const split = computeShares({ amount: input.amount, mode: input.splitMode, participantIds: input.participantIds, customValues: input.customValues, percentages: input.percentages });
  if (!split.ok) return err(split.error);
  if (id) {
    const cur = state.expenses.find((e) => e.id === id); if (!cur) return err("Despesa não encontrada.");
    const next = { ...cur, ...input, shares: split.shares };
    commit({ ...state, expenses: state.expenses.map((e) => (e.id === id ? next : e)) }, "Despesa editada", `${next.description}: ${fmt(cur.amount, trip.currency)} → ${fmt(next.amount, trip.currency)}`);
    return ok(next);
  }
  const exp: Expense = { ...input, id: uid(), shares: split.shares, createdAt: now() };
  commit({ ...state, expenses: [...state.expenses, exp] }, "Despesa registrada", `${exp.description} · ${fmt(exp.amount, trip.currency)}`);
  return ok(exp);
}
export function deleteExpense(id: string): Result {
  const e = state.expenses.find((x) => x.id === id); if (!e) return err("Despesa não encontrada.");
  commit({ ...state, expenses: state.expenses.filter((x) => x.id !== id) }, "Despesa excluída", `${e.description} · ${fmt(e.amount)}`);
  return ok(undefined);
}

/* ---------- Payments (settlements; no real money moves) ---------- */
export function registerPayment(p: Omit<Payment, "id" | "createdAt">, maxOwed?: number): Result<Payment> {
  if (!state.trips.some((t) => t.id === p.tripId)) return err("Viagem não encontrada.");
  if (p.from === p.to) return err("Pagador e recebedor devem ser diferentes.");
  if (!Number.isInteger(p.amount) || p.amount <= 0) return err("Informe um valor maior que zero.");
  if (maxOwed !== undefined && p.amount > maxOwed) return err("O valor ultrapassa a dívida pendente.");
  if (!p.date) return err("Informe a data do pagamento.");
  const pay = { ...p, id: uid(), createdAt: now() };
  commit({ ...state, payments: [...state.payments, pay] }, "Pagamento registrado", `${nameOf(p.from)} → ${nameOf(p.to)} · ${fmt(p.amount)}`);
  return ok(pay);
}
export function deletePayment(id: string) {
  const p = state.payments.find((x) => x.id === id); if (!p) return;
  commit({ ...state, payments: state.payments.filter((x) => x.id !== id) }, "Pagamento excluído", `${nameOf(p.from)} → ${nameOf(p.to)} · ${fmt(p.amount)}`);
}

/* ---------- Profile ---------- */
export function updateProfile(name: string, email: string): Result {
  if (!name.trim()) return err("Informe seu nome.");
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return err("E-mail inválido.");
  commit({ ...state, profile: { name: name.trim(), email: email.trim() }, participants: state.participants.map((p) => (p.id === ME ? { ...p, name: name.trim(), email: email.trim() } : p)) }, "Perfil atualizado", name);
  return ok(undefined);
}
export function updateSettings(s: Partial<Settings>): Result {
  if (s.alertThreshold !== undefined && (s.alertThreshold < 1 || s.alertThreshold > 100)) return err("Limite deve estar entre 1% e 100%.");
  commit({ ...state, settings: { ...state.settings, ...s } }, "Preferências alteradas", Object.keys(s).join(", "));
  return ok(undefined);
}
export function resetAll() { state = initialState(); persist(); emit(); }

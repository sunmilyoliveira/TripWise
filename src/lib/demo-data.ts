import gramado from "@/assets/gramado.jpg";
import buenosAires from "@/assets/buenos-aires.jpg";
import paris from "@/assets/paris.jpg";

export type TripStatus = "Planejando" | "Confirmada" | "Em andamento" | "Concluída";

export interface Participant { id: string; name: string; initials: string }
export interface Trip {
  id: string; name: string; destination: string; country: string; image: string;
  start: string; end: string; participants: string[]; budget: number; spent: number; status: TripStatus;
}
export interface Expense {
  id: string; tripId: string; title: string; category: Category; amount: number;
  paidBy: string; split: "igual" | "personalizada"; shares: Record<string, number>; date: string;
}
export type Category = "Hospedagem" | "Transporte" | "Alimentação" | "Passeios" | "Compras";

export const currentUserId = "ana";

export const participants: Participant[] = [
  { id: "ana", name: "Ana Souza", initials: "AS" },
  { id: "bruno", name: "Bruno Lima", initials: "BL" },
  { id: "carla", name: "Carla Mendes", initials: "CM" },
  { id: "diego", name: "Diego Rocha", initials: "DR" },
];

export const participantById = (id: string) => participants.find((p) => p.id === id)!;

export const trips: Trip[] = [
  { id: "gramado", name: "Inverno na Serra", destination: "Gramado", country: "Brasil", image: gramado,
    start: "2026-12-18", end: "2026-12-23", participants: ["ana", "bruno"], budget: 6500, spent: 3840, status: "Confirmada" },
  { id: "buenos-aires", name: "Tango & Vinhos", destination: "Buenos Aires", country: "Argentina", image: buenosAires,
    start: "2027-02-10", end: "2027-02-16", participants: ["ana", "bruno", "carla", "diego"], budget: 14800, spent: 6120, status: "Planejando" },
  { id: "paris", name: "Primavera em Paris", destination: "Paris", country: "França", image: paris,
    start: "2027-04-05", end: "2027-04-14", participants: ["ana", "carla", "diego"], budget: 32000, spent: 11450, status: "Planejando" },
];

const eq = (ids: string[], amount: number) =>
  Object.fromEntries(ids.map((id) => [id, Math.round((amount / ids.length) * 100) / 100]));

export const expenses: Expense[] = [
  { id: "e1", tripId: "buenos-aires", title: "Passagens aéreas GRU–EZE", category: "Transporte", amount: 3920, paidBy: "ana", split: "igual", shares: eq(["ana","bruno","carla","diego"], 3920), date: "2026-10-02" },
  { id: "e2", tripId: "buenos-aires", title: "Apartamento em Palermo", category: "Hospedagem", amount: 1680, paidBy: "bruno", split: "igual", shares: eq(["ana","bruno","carla","diego"], 1680), date: "2026-10-08" },
  { id: "e3", tripId: "buenos-aires", title: "Show de tango + jantar", category: "Passeios", amount: 520, paidBy: "carla", split: "personalizada", shares: { ana: 130, bruno: 130, carla: 260 }, date: "2026-10-20" },
  { id: "e4", tripId: "gramado", title: "Pousada Vale Verde", category: "Hospedagem", amount: 2400, paidBy: "ana", split: "igual", shares: eq(["ana","bruno"], 2400), date: "2026-09-14" },
  { id: "e5", tripId: "gramado", title: "Aluguel de carro", category: "Transporte", amount: 860, paidBy: "bruno", split: "igual", shares: eq(["ana","bruno"], 860), date: "2026-09-22" },
  { id: "e6", tripId: "gramado", title: "Fondue no Centro", category: "Alimentação", amount: 580, paidBy: "ana", split: "igual", shares: eq(["ana","bruno"], 580), date: "2026-10-01" },
  { id: "e7", tripId: "paris", title: "Voo GRU–CDG", category: "Transporte", amount: 8700, paidBy: "diego", split: "igual", shares: eq(["ana","carla","diego"], 8700), date: "2026-08-30" },
  { id: "e8", tripId: "paris", title: "Hotel Le Marais (sinal)", category: "Hospedagem", amount: 2750, paidBy: "carla", split: "igual", shares: eq(["ana","carla","diego"], 2750), date: "2026-09-10" },
];

export const categoryTotals = (list = expenses) => {
  const map = new Map<Category, number>();
  list.forEach((e) => map.set(e.category, (map.get(e.category) ?? 0) + e.amount));
  return Array.from(map, ([name, value]) => ({ name, value }));
};

/** Net balance per participant: positive = has to receive. */
export const balances = (list = expenses) => {
  const b: Record<string, number> = Object.fromEntries(participants.map((p) => [p.id, 0]));
  list.forEach((e) => {
    b[e.paidBy] += e.amount;
    Object.entries(e.shares).forEach(([id, v]) => (b[id] -= v));
  });
  return b;
};

/** Greedy minimal transfers suggestion. */
export const suggestTransfers = (bal = balances()) => {
  const debtors = Object.entries(bal).filter(([, v]) => v < -0.01).map(([id, v]) => ({ id, v: -v })).sort((a, b) => b.v - a.v);
  const creditors = Object.entries(bal).filter(([, v]) => v > 0.01).map(([id, v]) => ({ id, v })).sort((a, b) => b.v - a.v);
  const out: { from: string; to: string; amount: number }[] = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amt = Math.min(debtors[i].v, creditors[j].v);
    out.push({ from: debtors[i].id, to: creditors[j].id, amount: Math.round(amt * 100) / 100 });
    debtors[i].v -= amt; creditors[j].v -= amt;
    if (debtors[i].v < 0.01) i++;
    if (creditors[j].v < 0.01) j++;
  }
  return out;
};

export const paymentHistory = [
  { id: "p1", from: "bruno", to: "ana", amount: 450, date: "2026-10-12", status: "Recebido" as const },
  { id: "p2", from: "diego", to: "carla", amount: 300, date: "2026-10-18", status: "Recebido" as const },
  { id: "p3", from: "carla", to: "ana", amount: 600, date: "2026-10-25", status: "Pendente" as const },
];

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

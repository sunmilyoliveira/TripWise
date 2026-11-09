import { describe, it, expect, beforeEach } from "vitest";
import { computeShares, tripBalances, suggestTransfers } from "./finance";
import { parseMoney } from "./money";
import * as store from "./store";
import { ME } from "./types";

function setupTrip() {
  store._setState(store.initialState());
  const ids = ["Ana", "Bruno", "Carla"].map((n) => (store.addParticipant(n) as { ok: true; value: { id: string } }).value.id);
  const t = store.saveTrip({ name: "Teste", destination: "Rio", start: "2027-01-01", end: "2027-01-05", currency: "BRL", budget: 100000, participantIds: ids, categoryBudgets: {}, individualBudgets: {} });
  if (!t.ok) throw new Error(t.error);
  return { trip: t.value, ids };
}
const base = { category: "Alimentação" as const, date: "2027-01-02", paymentMethod: "Pix", notes: "", customValues: {}, percentages: {} };

describe("Teste 1 — divisão igualitária", () => {
  beforeEach(() => store._setState(store.initialState()));
  it("R$ 240 pago pelo usuário entre 4 → R$ 60 cada e R$ 180 a receber", () => {
    const { trip, ids } = setupTrip();
    const r = store.saveExpense({ ...base, tripId: trip.id, description: "Jantar", amount: 24000, paidBy: ME, splitMode: "igual", participantIds: [ME, ...ids] });
    expect(r.ok).toBe(true);
    if (r.ok) Object.values(r.value.shares).forEach((v) => expect(v).toBe(6000));
    const bal = tripBalances(store.getState(), store.getState().trips[0]!);
    expect(bal[ME]).toBe(18000);
    ids.forEach((id) => expect(bal[id]).toBe(-6000));
  });
});

describe("Teste 2 — divisão personalizada", () => {
  it("100 + 80 + 120 = 300 é aceito", () => {
    const r = computeShares({ amount: 30000, mode: "valores", participantIds: ["a", "b", "c"], customValues: { a: 10000, b: 8000, c: 12000 }, percentages: {} });
    expect(r.ok).toBe(true);
  });
  it("soma diferente do total é rejeitada", () => {
    const r = computeShares({ amount: 30000, mode: "valores", participantIds: ["a", "b", "c"], customValues: { a: 10000, b: 8000, c: 11000 }, percentages: {} });
    expect(r.ok).toBe(false);
  });
  it("percentuais precisam somar 100% e não perdem centavos", () => {
    expect(computeShares({ amount: 10000, mode: "porcentagem", participantIds: ["a", "b"], customValues: {}, percentages: { a: 5000, b: 4000 } }).ok).toBe(false);
    const r = computeShares({ amount: 10000, mode: "porcentagem", participantIds: ["a", "b", "c"], customValues: {}, percentages: { a: 3333, b: 3333, c: 3334 } });
    expect(r.ok && Object.values(r.shares).reduce((x, y) => x + y, 0)).toBe(10000);
  });
  it("R$ 100 igualitário entre 3 soma exatamente R$ 100", () => {
    const r = computeShares({ amount: 10000, mode: "igual", participantIds: ["a", "b", "c"], customValues: {}, percentages: {} });
    expect(r.ok && Object.values(r.shares).sort()).toEqual([3333, 3333, 3334]);
  });
});

describe("Teste 3 — pagamento parcial", () => {
  it("deve 60, paga 25 → pendente 35", () => {
    const { trip, ids } = setupTrip();
    store.saveExpense({ ...base, tripId: trip.id, description: "Jantar", amount: 24000, paidBy: ME, splitMode: "igual", participantIds: [ME, ...ids] });
    const r = store.registerPayment({ tripId: trip.id, from: ids[0]!, to: ME, amount: 2500, date: "2027-01-03", note: "" }, 6000);
    expect(r.ok).toBe(true);
    const bal = tripBalances(store.getState(), store.getState().trips[0]!);
    expect(bal[ids[0]!]).toBe(-3500);
    expect(suggestTransfers(bal).find((t) => t.from === ids[0])?.amount).toBe(3500);
  });
  it("pagamento acima da dívida é recusado", () => {
    const { trip, ids } = setupTrip();
    expect(store.registerPayment({ tripId: trip.id, from: ids[0]!, to: ME, amount: 7000, date: "2027-01-03", note: "" }, 6000).ok).toBe(false);
  });
});

describe("validações", () => {
  it("valores negativos são inválidos", () => {
    expect(parseMoney("-10")).toBeNull();
    expect(parseMoney("1.234,56")).toBe(123456);
  });
});

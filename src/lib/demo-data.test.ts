import { describe, it, expect } from "vitest";
import { balances, suggestTransfers, expenses } from "./demo-data";

describe("divisão de despesas", () => {
  it("saldos somam zero", () => {
    const total = Object.values(balances()).reduce((a, b) => a + b, 0);
    expect(Math.abs(total)).toBeLessThan(0.05);
  });
  it("transferências sugeridas zeram os saldos", () => {
    const b = balances(expenses);
    suggestTransfers(b).forEach((t) => { b[t.from] = (b[t.from] ?? 0) + t.amount; b[t.to] = (b[t.to] ?? 0) - t.amount; });
    Object.values(b).forEach((v) => expect(Math.abs(v)).toBeLessThan(0.05));
  });
});

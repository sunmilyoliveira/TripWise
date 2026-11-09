import type { Currency } from "./types";

/** Parse "1.234,56" / "1234.56" / "R$ 10" into integer cents. Returns null if invalid or negative. */
export function parseMoney(input: string): number | null {
  let s = input.replace(/[R$\s]/g, "").trim();
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}
export const centsToInput = (c: number) => (c / 100).toFixed(2).replace(".", ",");

export function fmt(cents: number, currency: Currency = "BRL") {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency });
}
export const fmtPct = (bp: number) => `${(bp / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;

/** Distribute `total` cents across weights with no rounding loss (largest remainder). */
export function distribute(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => (total * w) / sum);
  const out = raw.map(Math.floor);
  let rest = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => ({ i, f: r - Math.floor(r) })).sort((a, b) => b.f - a.f || a.i - b.i);
  for (let k = 0; rest > 0; k = (k + 1) % order.length, rest--) out[order[k]!.i]! += 1;
  return out;
}

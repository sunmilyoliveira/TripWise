/** All money values are integer cents. Percentages are basis points (100% = 10000). */
export const CATEGORIES = ["Hospedagem", "Alimentação", "Transporte", "Passeios", "Compras", "Passagens", "Outros"] as const;
export type Category = (typeof CATEGORIES)[number];
export const SPLIT_MODES = { igual: "Igualitária", valores: "Valores personalizados", porcentagem: "Porcentagem", individual: "Individual" } as const;
export type SplitMode = keyof typeof SPLIT_MODES;
export const PAYMENT_METHODS = ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro", "Transferência", "Outro"] as const;
export const CURRENCIES = ["BRL", "USD", "EUR", "ARS", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];
export type Role = "organizador" | "editor" | "leitor";
export const ME = "me";

export interface Participant { id: string; name: string; email: string }
export interface Invite { id: string; email: string; role: Role; createdAt: string }
export interface Trip {
  id: string; name: string; destination: string; start: string; end: string; currency: Currency;
  budget: number; categoryBudgets: Partial<Record<Category, number>>; individualBudgets: Record<string, number>;
  participantIds: string[]; roles: Record<string, Role>; invites: Invite[];
  shareLink: { token: string; active: boolean; createdAt: string } | null; createdAt: string;
}
export interface Expense {
  id: string; tripId: string; description: string; amount: number; date: string; category: Category;
  paidBy: string; splitMode: SplitMode; participantIds: string[];
  customValues: Record<string, number>; percentages: Record<string, number>;
  shares: Record<string, number>; paymentMethod: string; notes: string; createdAt: string;
}
export interface Payment { id: string; tripId: string; from: string; to: string; amount: number; date: string; note: string; createdAt: string }
export interface LogEntry { id: string; at: string; action: string; detail: string }
export interface Settings { currency: Currency; budgetAlerts: boolean; alertThreshold: number; settleReminders: boolean; weeklySummary: boolean }
export interface AppState {
  version: 1; profile: { name: string; email: string }; settings: Settings;
  participants: Participant[]; trips: Trip[]; expenses: Expense[]; payments: Payment[]; log: LogEntry[];
}

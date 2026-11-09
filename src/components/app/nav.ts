import { LayoutDashboard, Plane, Receipt, Users, HandCoins, Sparkles, BarChart3, Settings } from "lucide-react";
export const navItems = [
  { to: "/", label: "Dashboard", short: "Início", icon: LayoutDashboard },
  { to: "/viagens", label: "Minhas viagens", short: "Viagens", icon: Plane },
  { to: "/despesas", label: "Despesas", short: "Despesas", icon: Receipt },
  { to: "/divisao", label: "Divisão de despesas", short: "Divisão", icon: Users },
  { to: "/acerto", label: "Acerto de contas", short: "Acerto", icon: HandCoins },
  { to: "/assistente", label: "Assistente IA", short: "IA", icon: Sparkles },
  { to: "/relatorios", label: "Relatórios", short: "Relatórios", icon: BarChart3 },
  { to: "/perfil", label: "Perfil e configurações", short: "Perfil", icon: Settings },
] as const;
export const mobilePrimary = ["/", "/viagens", "/divisao", "/assistente"];

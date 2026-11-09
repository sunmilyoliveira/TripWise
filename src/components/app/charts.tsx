import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import { fmt } from "@/lib/money";
import type { Currency } from "@/lib/types";

export const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--positive)", "var(--warning)"];
const tip = (c: Currency) => ({ contentStyle: { borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }, formatter: (v: number) => fmt(v, c) });
const axisK = (v: number) => (v >= 100000 ? `${Math.round(v / 100000)}k` : String(Math.round(v / 100)));

export function CategoryDonut({ data, currency = "BRL" }: { data: { name: string; value: number }[]; currency?: Currency }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  if (!total) return <p className="py-10 text-center text-sm text-muted-foreground">Sem despesas no período.</p>;
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative size-44 shrink-0">
        <PieChart width={176} height={176}>
          <Pie isAnimationActive={false} cx={88} cy={88} startAngle={90} endAngle={-270} data={data} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={data.length > 1 ? 2 : 0} stroke="none">
            {data.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
          </Pie>
          <Tooltip {...tip(currency)} />
        </PieChart>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><div className="text-[11px] text-muted-foreground">Total</div><div className="font-display text-sm font-semibold text-navy tabular">{fmt(total, currency)}</div></div>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: chartColors[i % chartColors.length] }} />{d.name}</span>
            <span className="text-muted-foreground tabular">{fmt(d.value, currency)} · {Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GroupedBars({ data, keys, currency = "BRL" }: { data: Record<string, string | number>[]; keys: [string, string]; currency?: Currency }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-muted-foreground">Sem dados.</p>;
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <BarChart data={data} barGap={6}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" tickFormatter={axisK} width={40} />
          <Tooltip {...tip(currency)} cursor={{ fill: "var(--muted)" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={keys[0]} fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          <Bar dataKey={keys[1]} fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Evolution({ data, currency = "BRL" }: { data: { name: string; Diário: number; Acumulado: number }[]; currency?: Currency }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-muted-foreground">Sem despesas no período.</p>;
  return (
    <div className="h-64">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" />
          <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" tickFormatter={axisK} width={40} />
          <Tooltip {...tip(currency)} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="Acumulado" stroke="var(--chart-1)" fill="var(--accent)" strokeWidth={2} />
          <Area type="monotone" dataKey="Diário" stroke="var(--chart-2)" fill="transparent" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

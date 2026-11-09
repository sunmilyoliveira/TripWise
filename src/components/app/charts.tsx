import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { brl } from "@/lib/demo-data";

export const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const tip = { contentStyle: { borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }, formatter: (v: number) => brl(v) };

export function CategoryDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative size-44 shrink-0">
          <PieChart width={176} height={176}>
            <Pie isAnimationActive={false} cx={88} cy={88} startAngle={90} endAngle={-270} data={data} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
              {data.map((_, i) => <Cell key={i} fill={chartColors[i % 5]} />)}
            </Pie>
            <Tooltip {...tip} />
          </PieChart>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><div className="text-[11px] text-muted-foreground">Total</div><div className="font-display text-sm font-semibold text-navy tabular">{brl(total)}</div></div>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 pr-3"><span className="size-2.5 rounded-full" style={{ background: chartColors[i % 5] }} />{d.name}</span>
            <span className="text-muted-foreground tabular">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlannedVsActual({ data }: { data: { name: string; Planejado: number; Realizado: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer>
        <BarChart data={data} barGap={6}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--muted-foreground)" tickFormatter={(v) => `${v / 1000}k`} width={36} />
          <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Planejado" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Realizado" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

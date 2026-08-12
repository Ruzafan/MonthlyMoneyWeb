"use client";

import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { totalByCategory, type Tx } from "@/lib/aggregations";
import type { PlainCategory } from "@/lib/queries";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function CategoryBreakdown({
  transactions,
  categories,
  months,
}: {
  transactions: Tx[];
  categories: PlainCategory[];
  months: string[];
}) {
  const [month, setMonth] = useState<string>("all");
  const categoryById = new Map(categories.map((c) => [c._id, c]));

  const filtered = useMemo(
    () => (month === "all" ? transactions : transactions.filter((t) => t.date.slice(0, 7) === month)),
    [transactions, month]
  );

  const totals = totalByCategory(filtered, "expense");
  const total = totals.reduce((s, t) => s + t.total, 0);

  const data = totals.map((t) => ({
    name: categoryById.get(t.categoryId)?.name ?? "Sin categoría",
    value: t.total,
    color: categoryById.get(t.categoryId)?.color ?? "#94a3b8",
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gasto por categoría</CardTitle>
        <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-40">
          <option value="all">Todo el periodo</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(`${m}-01`))}
            </option>
          ))}
        </Select>
      </CardHeader>
      <CardContent className="pt-2">
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted">Sin gastos en este periodo.</div>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-64 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {data.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="var(--surface)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => currency.format(Number(value))}
                    contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full space-y-2 sm:w-1/2">
              {data.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="truncate">{d.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 tabular-nums">
                    <span className="font-medium">{currency.format(d.value)}</span>
                    <span className="w-10 text-right text-xs text-muted">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

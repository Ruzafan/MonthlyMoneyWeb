"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { MonthSummary } from "@/lib/aggregations";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", { month: "short" }).format(new Date(y, m - 1, 1));
}

export function MonthlyChart({ data }: { data: MonthSummary[] }) {
  const chartData = data.map((d) => ({ ...d, label: monthLabel(d.month) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingresos vs gastos por mes</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => currency.format(v)}
                width={70}
              />
              <Tooltip
                formatter={(value) => currency.format(Number(value))}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="income" name="Ingresos" fill="var(--income)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Gastos" fill="var(--expense)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { MonthSummary } from "@/lib/aggregations";

const percent = new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 0 });

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", { month: "short" }).format(new Date(y, m - 1, 1));
}

export function SavingsTrendChart({ data }: { data: MonthSummary[] }) {
  const chartData = data.map((d) => ({ ...d, label: monthLabel(d.month) }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasa de ahorro mensual</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: "var(--muted)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => percent.format(v)}
                width={55}
              />
              <Tooltip
                formatter={(value) => percent.format(Number(value))}
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
              />
              <Line type="monotone" dataKey="savingsRate" name="Tasa de ahorro" stroke="var(--savings)" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

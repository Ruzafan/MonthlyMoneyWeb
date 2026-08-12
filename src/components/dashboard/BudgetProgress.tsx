import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { totalByCategory, type Tx } from "@/lib/aggregations";
import type { PlainCategory } from "@/lib/queries";
import clsx from "clsx";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function BudgetProgress({ currentMonthTx, categories }: { currentMonthTx: Tx[]; categories: PlainCategory[] }) {
  const withBudget = categories.filter((c) => c.type === "expense" && c.budgetLimit);
  const totals = new Map(totalByCategory(currentMonthTx, "expense").map((t) => [t.categoryId, t.total]));

  if (withBudget.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Presupuestos del mes</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 text-sm text-muted">
          Define un límite de presupuesto en tus categorías de gasto para verlo aquí.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Presupuestos del mes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {withBudget.map((c) => {
          const spent = totals.get(c._id) ?? 0;
          const limit = c.budgetLimit ?? 0;
          const pct = limit > 0 ? Math.min(spent / limit, 1) : 0;
          const over = spent > limit;
          return (
            <div key={c._id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <span className={clsx("tabular-nums", over ? "font-medium text-expense" : "text-muted")}>
                  {currency.format(spent)} / {currency.format(limit)}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <div
                  className={clsx("h-full rounded-full transition-all", over ? "bg-expense" : "bg-accent")}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

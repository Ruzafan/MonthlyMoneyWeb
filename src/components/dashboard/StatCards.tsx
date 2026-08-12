import { Card } from "@/components/ui/Card";
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from "lucide-react";
import clsx from "clsx";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const percent = new Intl.NumberFormat("es-ES", { style: "percent", maximumFractionDigits: 1 });

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  tone: "income" | "expense" | "neutral";
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span
          className={clsx(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "income" && "bg-income-soft text-income",
            tone === "expense" && "bg-expense-soft text-expense",
            tone === "neutral" && "bg-accent/10 text-accent"
          )}
        >
          <Icon size={16} />
        </span>
      </div>
      <p
        className={clsx(
          "mt-3 text-2xl font-semibold tracking-tight",
          tone === "income" && "text-income",
          tone === "expense" && "text-expense"
        )}
      >
        {value}
      </p>
    </Card>
  );
}

export function StatCards({
  income,
  expense,
  savings,
  savingsRate,
}: {
  income: number;
  expense: number;
  savings: number;
  savingsRate: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Ingresos" value={currency.format(income)} icon={ArrowUpRight} tone="income" />
      <StatCard label="Gastos" value={currency.format(expense)} icon={ArrowDownRight} tone="expense" />
      <StatCard label="Ahorro" value={currency.format(savings)} icon={PiggyBank} tone={savings >= 0 ? "income" : "expense"} />
      <StatCard label="Tasa de ahorro" value={percent.format(savingsRate)} icon={Wallet} tone={savingsRate >= 0 ? "income" : "expense"} />
    </div>
  );
}

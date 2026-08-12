export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { StatCards } from "@/components/dashboard/StatCards";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { SavingsTrendChart } from "@/components/dashboard/SavingsTrendChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { getCategories, getTransactions } from "@/lib/queries";
import { overallSavings, summarizeByMonth } from "@/lib/aggregations";

export default async function DashboardPage() {
  const [categories, transactions] = await Promise.all([getCategories(), getTransactions()]);

  const monthly = summarizeByMonth(transactions);
  const overall = overallSavings(transactions);
  const months = monthly.map((m) => m.month);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTx = transactions.filter((t) => t.date.slice(0, 7) === currentMonth);

  return (
    <>
      <Header title="Resumen" subtitle="Tu situación financiera de un vistazo" categories={categories} />
      <main className="flex-1 space-y-5 p-6">
        <StatCards income={overall.income} expense={overall.expense} savings={overall.savings} savingsRate={overall.savingsRate} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <MonthlyChart data={monthly} />
          <SavingsTrendChart data={monthly} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CategoryBreakdown transactions={transactions} categories={categories} months={months} />
          <BudgetProgress currentMonthTx={currentMonthTx} categories={categories} />
        </div>
      </main>
    </>
  );
}

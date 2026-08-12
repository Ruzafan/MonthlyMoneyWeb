export type Tx = {
  type: "expense" | "income";
  amount: number;
  date: string;
  categoryId: string;
};

export type MonthSummary = {
  month: string; // "YYYY-MM"
  income: number;
  expense: number;
  savings: number;
  savingsRate: number; // 0..1, 0 if income is 0
};

function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function summarizeByMonth(transactions: Tx[]): MonthSummary[] {
  const byMonth = new Map<string, { income: number; expense: number }>();

  for (const tx of transactions) {
    const key = monthKey(tx.date);
    const entry = byMonth.get(key) ?? { income: 0, expense: 0 };
    if (tx.type === "income") entry.income += tx.amount;
    else entry.expense += tx.amount;
    byMonth.set(key, entry);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { income, expense }]) => {
      const savings = income - expense;
      return {
        month,
        income,
        expense,
        savings,
        savingsRate: income > 0 ? savings / income : 0,
      };
    });
}

export type CategoryTotal = {
  categoryId: string;
  total: number;
};

export function totalByCategory(transactions: Tx[], type: "expense" | "income" = "expense"): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== type) continue;
    totals.set(tx.categoryId, (totals.get(tx.categoryId) ?? 0) + tx.amount);
  }
  return [...totals.entries()]
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
}

export function overallSavings(transactions: Tx[]): { income: number; expense: number; savings: number; savingsRate: number } {
  const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savings = income - expense;
  return { income, expense, savings, savingsRate: income > 0 ? savings / income : 0 };
}

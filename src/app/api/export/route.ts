import { NextResponse } from "next/server";
import { Category } from "@/lib/models/Category";
import { Transaction } from "@/lib/models/Transaction";
import { requireUserId } from "@/lib/session";
import { BACKUP_VERSION, type Backup } from "@/lib/backup";

export async function GET() {
  const userId = await requireUserId();

  const [categories, transactions] = await Promise.all([
    Category.find({ userId }).lean(),
    Transaction.find({ userId }).lean(),
  ]);

  const categoryById = new Map(categories.map((c) => [String(c._id), c]));

  const backup: Backup = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    categories: categories.map((c) => ({
      name: c.name,
      type: c.type,
      color: c.color,
      budgetLimit: c.budgetLimit ?? null,
    })),
    transactions: transactions.map((t) => {
      const category = categoryById.get(String(t.categoryId));
      return {
        type: t.type,
        amount: t.amount,
        date: t.date.toISOString(),
        categoryName: category?.name ?? "Sin categoría",
        categoryType: category?.type ?? t.type,
        tags: t.tags ?? [],
        description: t.description ?? undefined,
      };
    }),
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="finanzas-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

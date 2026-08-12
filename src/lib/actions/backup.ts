"use server";

import { revalidatePath } from "next/cache";
import { Category } from "@/lib/models/Category";
import { Transaction } from "@/lib/models/Transaction";
import { requireUserId } from "@/lib/session";
import { backupSchema } from "@/lib/backup";
import type { ActionResult } from "./categories";

export async function importBackup(input: unknown): Promise<ActionResult<{ categoriesCreated: number; transactionsImported: number; skipped: number }>> {
  const parsed = backupSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "El archivo no tiene el formato esperado" };
  }
  const userId = await requireUserId();
  const { categories, transactions } = parsed.data;

  const existing = await Category.find({ userId }).lean();
  const keyOf = (name: string, type: string) => `${type}:${name.toLowerCase()}`;
  const categoryIdByKey = new Map(existing.map((c) => [keyOf(c.name, c.type), String(c._id)]));

  let categoriesCreated = 0;
  for (const c of categories) {
    const key = keyOf(c.name, c.type);
    if (categoryIdByKey.has(key)) continue;
    const created = await Category.create({
      name: c.name,
      type: c.type,
      color: c.color,
      budgetLimit: c.budgetLimit ?? undefined,
      userId,
    });
    categoryIdByKey.set(key, String(created._id));
    categoriesCreated++;
  }

  let transactionsImported = 0;
  let skipped = 0;
  for (const t of transactions) {
    const categoryId = categoryIdByKey.get(keyOf(t.categoryName, t.categoryType));
    if (!categoryId) {
      skipped++;
      continue;
    }
    await Transaction.create({
      type: t.type,
      amount: t.amount,
      date: new Date(t.date),
      categoryId,
      tags: t.tags,
      description: t.description,
      userId,
    });
    transactionsImported++;
  }

  revalidatePath("/");
  revalidatePath("/movimientos");
  revalidatePath("/categorias");

  return { success: true, data: { categoriesCreated, transactionsImported, skipped } };
}

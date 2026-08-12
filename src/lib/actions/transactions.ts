"use server";

import { revalidatePath } from "next/cache";
import { Transaction } from "@/lib/models/Transaction";
import { transactionSchema } from "@/lib/validation";
import { requireUserId } from "@/lib/session";
import type { ActionResult } from "./categories";

export async function createTransaction(input: unknown): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const userId = await requireUserId();
  await Transaction.create({ ...parsed.data, userId });
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function updateTransaction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const userId = await requireUserId();
  await Transaction.findOneAndUpdate({ _id: id, userId }, parsed.data);
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  await Transaction.deleteOne({ _id: id, userId });
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

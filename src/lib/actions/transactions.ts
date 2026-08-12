"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/lib/models/Transaction";
import { transactionSchema } from "@/lib/validation";
import type { ActionResult } from "./categories";

const USER_ID = "default-user";

export async function createTransaction(input: unknown): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  await connectDB();
  await Transaction.create({ ...parsed.data, userId: USER_ID });
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function updateTransaction(id: string, input: unknown): Promise<ActionResult> {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  await connectDB();
  await Transaction.findOneAndUpdate({ _id: id, userId: USER_ID }, parsed.data);
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function deleteTransaction(id: string): Promise<ActionResult> {
  await connectDB();
  await Transaction.deleteOne({ _id: id, userId: USER_ID });
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Transaction } from "@/lib/models/Transaction";
import { categorySchema } from "@/lib/validation";

const USER_ID = "default-user";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createCategory(input: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  await connectDB();
  await Category.create({ ...parsed.data, userId: USER_ID });
  revalidatePath("/categorias");
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function updateCategory(id: string, input: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  await connectDB();
  await Category.findOneAndUpdate({ _id: id, userId: USER_ID }, parsed.data);
  revalidatePath("/categorias");
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await connectDB();
  const inUse = await Transaction.exists({ categoryId: id, userId: USER_ID });
  if (inUse) {
    return { success: false, error: "No se puede eliminar: hay movimientos con esta categoría" };
  }
  await Category.deleteOne({ _id: id, userId: USER_ID });
  revalidatePath("/categorias");
  return { success: true, data: undefined };
}

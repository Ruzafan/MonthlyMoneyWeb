"use server";

import { revalidatePath } from "next/cache";
import { Category } from "@/lib/models/Category";
import { Transaction } from "@/lib/models/Transaction";
import { categorySchema } from "@/lib/validation";
import { requireUserId } from "@/lib/session";

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

const DUPLICATE_CATEGORY_ERROR = "Ya tienes una categoría con ese nombre y tipo";

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000;
}

export async function createCategory(input: unknown): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }
  const userId = await requireUserId();
  try {
    await Category.create({ ...parsed.data, userId });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return { success: false, error: DUPLICATE_CATEGORY_ERROR };
    }
    throw err;
  }
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
  const userId = await requireUserId();
  try {
    await Category.findOneAndUpdate({ _id: id, userId }, parsed.data);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return { success: false, error: DUPLICATE_CATEGORY_ERROR };
    }
    throw err;
  }
  revalidatePath("/categorias");
  revalidatePath("/movimientos");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const userId = await requireUserId();
  const inUse = await Transaction.exists({ categoryId: id, userId });
  if (inUse) {
    return { success: false, error: "No se puede eliminar: hay movimientos con esta categoría" };
  }
  await Category.deleteOne({ _id: id, userId });
  revalidatePath("/categorias");
  return { success: true, data: undefined };
}

import "server-only";
import { Category } from "@/lib/models/Category";
import { Transaction } from "@/lib/models/Transaction";

const LEGACY_USER_ID = "default-user";

const DEFAULT_CATEGORIES = [
  { name: "Nómina", type: "income", color: "#22c55e" },
  { name: "Freelance", type: "income", color: "#14b8a6" },
  { name: "Otros ingresos", type: "income", color: "#0ea5e9" },
  { name: "Vivienda", type: "expense", color: "#f97316", budgetLimit: 900 },
  { name: "Alimentación", type: "expense", color: "#f59e0b", budgetLimit: 350 },
  { name: "Transporte", type: "expense", color: "#84cc16", budgetLimit: 120 },
  { name: "Ocio", type: "expense", color: "#ec4899", budgetLimit: 200 },
  { name: "Salud", type: "expense", color: "#8b5cf6", budgetLimit: 100 },
  { name: "Suscripciones", type: "expense", color: "#6366f1", budgetLimit: 60 },
  { name: "Otros gastos", type: "expense", color: "#94a3b8" },
] as const;

/**
 * Ensures a signed-in user has data to work with. First real user to sign in
 * claims any pre-auth demo data (userId "default-user"); everyone after that
 * starts with a fresh set of default categories.
 */
export async function ensureUserInitialized(userId: string) {
  const hasData = await Category.exists({ userId });
  if (hasData) return;

  const legacyData = await Category.exists({ userId: LEGACY_USER_ID });
  if (legacyData) {
    await Category.updateMany({ userId: LEGACY_USER_ID }, { userId });
    await Transaction.updateMany({ userId: LEGACY_USER_ID }, { userId });
    return;
  }

  await Category.insertMany(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })));
}

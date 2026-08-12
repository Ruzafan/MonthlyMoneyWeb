import "server-only";
import { Category } from "@/lib/models/Category";
import { Transaction } from "@/lib/models/Transaction";

const USER_ID = "default-user";

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

export async function ensureSeeded() {
  const count = await Category.countDocuments({ userId: USER_ID });
  if (count > 0) return;

  const categories = await Category.insertMany(
    DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: USER_ID }))
  );

  if (process.env.NODE_ENV === "production" && process.env.MONGODB_URI) {
    return; // don't seed fake demo transactions in a real production DB
  }

  const byName = Object.fromEntries(categories.map((c) => [c.name, c._id]));
  const today = new Date();
  const demoTx: { type: "expense" | "income"; amount: number; date: Date; categoryId: unknown; tags: string[]; description?: string }[] = [];

  for (let m = 2; m >= 0; m--) {
    const monthDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - m, 1));
    const y = monthDate.getUTCFullYear();
    const mo = monthDate.getUTCMonth();
    const d = (day: number) => new Date(Date.UTC(y, mo, day));

    demoTx.push({ type: "income", amount: 2100 + m * 20, date: d(1), categoryId: byName["Nómina"], tags: [] });
    if (m !== 1) {
      demoTx.push({ type: "income", amount: 250, date: d(12), categoryId: byName["Freelance"], tags: ["extra"] });
    }
    demoTx.push({ type: "expense", amount: 850, date: d(3), categoryId: byName["Vivienda"], tags: ["alquiler"] });
    demoTx.push({ type: "expense", amount: 40, date: d(3), categoryId: byName["Vivienda"], tags: ["suministros"] });
    demoTx.push({ type: "expense", amount: 220 + m * 10, date: d(8), categoryId: byName["Alimentación"], tags: ["supermercado"] });
    demoTx.push({ type: "expense", amount: 65, date: d(15), categoryId: byName["Alimentación"], tags: ["restaurante"] });
    demoTx.push({ type: "expense", amount: 45, date: d(5), categoryId: byName["Transporte"], tags: ["gasolina"] });
    demoTx.push({ type: "expense", amount: 55, date: d(20), categoryId: byName["Ocio"], tags: ["cine", "amigos"] });
    demoTx.push({ type: "expense", amount: 30, date: d(22), categoryId: byName["Salud"], tags: [] });
    demoTx.push({ type: "expense", amount: 15.99, date: d(1), categoryId: byName["Suscripciones"], tags: ["streaming"] });
    demoTx.push({ type: "expense", amount: 9.99, date: d(1), categoryId: byName["Suscripciones"], tags: ["música"] });
  }

  await Transaction.insertMany(demoTx.map((t) => ({ ...t, userId: USER_ID })));
}

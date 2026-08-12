import "server-only";
import { Category } from "@/lib/models/Category";
import { Transaction } from "@/lib/models/Transaction";
import { requireUserId } from "@/lib/session";

export type PlainCategory = {
  _id: string;
  name: string;
  type: "expense" | "income";
  color: string;
  budgetLimit?: number | null;
};

export type PlainTransaction = {
  _id: string;
  type: "expense" | "income";
  amount: number;
  date: string;
  categoryId: string;
  tags: string[];
  description?: string;
};

export async function getCategories(): Promise<PlainCategory[]> {
  const userId = await requireUserId();
  const docs = await Category.find({ userId }).sort({ name: 1 }).lean();
  return docs.map((d) => ({
    _id: String(d._id),
    name: d.name,
    type: d.type,
    color: d.color,
    budgetLimit: d.budgetLimit ?? null,
  }));
}

export type TransactionFilters = {
  from?: string;
  to?: string;
  categoryId?: string;
  tag?: string;
  type?: "expense" | "income";
};

export async function getTransactions(filters: TransactionFilters = {}): Promise<PlainTransaction[]> {
  const userId = await requireUserId();
  const query: Record<string, unknown> = { userId };
  if (filters.from || filters.to) {
    query.date = {
      ...(filters.from ? { $gte: new Date(filters.from) } : {}),
      ...(filters.to ? { $lte: new Date(filters.to) } : {}),
    };
  }
  if (filters.categoryId) query.categoryId = filters.categoryId;
  if (filters.tag) query.tags = filters.tag;
  if (filters.type) query.type = filters.type;

  const docs = await Transaction.find(query).sort({ date: -1 }).lean();
  return docs.map((d) => ({
    _id: String(d._id),
    type: d.type,
    amount: d.amount,
    date: d.date.toISOString(),
    categoryId: String(d.categoryId),
    tags: d.tags ?? [],
    description: d.description ?? undefined,
  }));
}

export async function getAllTags(): Promise<string[]> {
  const userId = await requireUserId();
  const tags = await Transaction.distinct("tags", { userId });
  return (tags as string[]).sort();
}

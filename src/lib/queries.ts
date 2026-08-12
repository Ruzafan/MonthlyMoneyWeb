import "server-only";
import { connectDB } from "@/lib/db";
import { Category } from "@/lib/models/Category";
import { Transaction } from "@/lib/models/Transaction";

const USER_ID = "default-user";

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
  await connectDB();
  const docs = await Category.find({ userId: USER_ID }).sort({ name: 1 }).lean();
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
  await connectDB();
  const query: Record<string, unknown> = { userId: USER_ID };
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
  await connectDB();
  const tags = await Transaction.distinct("tags", { userId: USER_ID });
  return (tags as string[]).sort();
}

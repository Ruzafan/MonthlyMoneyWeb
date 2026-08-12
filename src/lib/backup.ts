import { z } from "zod";
import { normalizeTags } from "@/lib/tags";

export const BACKUP_VERSION = 1;

export const backupCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(["expense", "income"]),
  color: z.string().min(1),
  budgetLimit: z.number().min(0).nullable().optional(),
});

export const backupTransactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive(),
  date: z.string().min(1),
  categoryName: z.string().min(1),
  categoryType: z.enum(["expense", "income"]),
  tags: z.array(z.string()).default([]).transform(normalizeTags),
  description: z.string().optional(),
});

export const backupSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  categories: z.array(backupCategorySchema),
  transactions: z.array(backupTransactionSchema),
});

export type Backup = z.infer<typeof backupSchema>;

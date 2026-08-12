import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive("El importe debe ser mayor que 0"),
  date: z.coerce.date(),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  tags: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  type: z.enum(["expense", "income"]),
  color: z.string().min(1),
  budgetLimit: z.coerce.number().min(0).optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

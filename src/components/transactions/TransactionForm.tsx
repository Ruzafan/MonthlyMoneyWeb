"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/Input";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import type { PlainCategory, PlainTransaction } from "@/lib/queries";
import clsx from "clsx";

const formSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.coerce.number().positive("Introduce un importe válido"),
  date: z.string().min(1, "Selecciona una fecha"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  tags: z.string().optional(),
  description: z.string().optional(),
});
type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm({
  categories,
  transaction,
  onDone,
}: {
  categories: PlainCategory[];
  transaction?: PlainTransaction;
  onDone: () => void;
}) {
  const [showDetails, setShowDetails] = useState(Boolean(transaction?.tags?.length || transaction?.description));
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          date: transaction.date.slice(0, 10),
          categoryId: transaction.categoryId,
          tags: transaction.tags.join(", "),
          description: transaction.description ?? "",
        }
      : { type: "expense", amount: undefined, date: todayISO(), categoryId: "", tags: "", description: "" },
  });

  const type = watch("type");
  const filteredCategories = categories.filter((c) => c.type === type);

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const payload = {
      type: values.type,
      amount: values.amount,
      date: values.date,
      categoryId: values.categoryId,
      tags: values.tags
        ? values.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      description: values.description || undefined,
    };
    const result = transaction
      ? await updateTransaction(transaction._id, payload)
      : await createTransaction(payload);

    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-muted p-1">
            {(["expense", "income"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => field.onChange(t)}
                className={clsx(
                  "rounded-md py-2 text-sm font-medium transition-colors",
                  field.value === t
                    ? t === "expense"
                      ? "bg-expense-soft text-expense"
                      : "bg-income-soft text-income"
                    : "text-muted hover:text-foreground"
                )}
              >
                {t === "expense" ? "Gasto" : "Ingreso"}
              </button>
            ))}
          </div>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Importe (€)</Label>
          <Input id="amount" type="number" step="0.01" inputMode="decimal" placeholder="0.00" {...register("amount")} />
          <FieldError>{errors.amount?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="date">Fecha</Label>
          <Input id="date" type="date" {...register("date")} />
          <FieldError>{errors.date?.message}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="categoryId">Categoría</Label>
        <select
          id="categoryId"
          className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          {...register("categoryId")}
        >
          <option value="">Selecciona una categoría</option>
          {filteredCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError>{errors.categoryId?.message}</FieldError>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        className="flex items-center gap-1.5 self-start text-sm font-medium text-muted hover:text-foreground"
      >
        <ChevronDown size={16} className={clsx("transition-transform", showDetails && "rotate-180")} />
        Más detalles
      </button>

      {showDetails && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <div>
            <Label htmlFor="tags">Tags (separados por comas)</Label>
            <Input id="tags" placeholder="viaje, trabajo" {...register("tags")} />
          </div>
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" rows={2} placeholder="Detalle opcional" {...register("description")} />
          </div>
        </div>
      )}

      {serverError && <p className="text-sm text-expense">{serverError}</p>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : transaction ? "Guardar cambios" : "Añadir movimiento"}
        </Button>
      </div>
    </form>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

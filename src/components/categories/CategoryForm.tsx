"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { PlainCategory } from "@/lib/queries";
import clsx from "clsx";

const PALETTE = ["#2f6f5e", "#22c55e", "#0ea5e9", "#f97316", "#f59e0b", "#84cc16", "#ec4899", "#8b5cf6", "#6366f1", "#c14b4b", "#94a3b8"];

const formSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  type: z.enum(["expense", "income"]),
  color: z.string().min(1),
  budgetLimit: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
});
type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export function CategoryForm({ category, onDone }: { category?: PlainCategory; onDone: () => void }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, FormOutput>({
    resolver: zodResolver(formSchema),
    defaultValues: category
      ? { name: category.name, type: category.type, color: category.color, budgetLimit: category.budgetLimit ?? "" }
      : { name: "", type: "expense", color: PALETTE[0], budgetLimit: "" },
  });

  const type = watch("type");
  const color = watch("color");

  async function onSubmit(values: FormOutput) {
    setServerError(null);
    const payload = {
      name: values.name,
      type: values.type,
      color: values.color,
      budgetLimit: values.budgetLimit === "" ? undefined : values.budgetLimit,
    };
    const result = category ? await updateCategory(category._id, payload) : await createCategory(payload);
    if (!result.success) {
      setServerError(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" placeholder="Ej. Ocio" {...register("name")} />
        <FieldError>{errors.name?.message}</FieldError>
      </div>

      <div>
        <Label>Tipo</Label>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-surface-muted p-1">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue("type", t)}
              className={clsx(
                "rounded-md py-2 text-sm font-medium transition-colors",
                type === t ? (t === "expense" ? "bg-expense-soft text-expense" : "bg-income-soft text-income") : "text-muted hover:text-foreground"
              )}
            >
              {t === "expense" ? "Gasto" : "Ingreso"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", c)}
              className={clsx(
                "h-7 w-7 rounded-full border-2 transition-transform",
                color === c ? "scale-110 border-foreground" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {type === "expense" && (
        <div>
          <Label htmlFor="budgetLimit">Presupuesto mensual (€, opcional)</Label>
          <Input id="budgetLimit" type="number" step="0.01" min="0" placeholder="Sin límite" {...register("budgetLimit")} />
        </div>
      )}

      {serverError && <p className="text-sm text-expense">{serverError}</p>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando…" : category ? "Guardar cambios" : "Crear categoría"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/transactions/TransactionForm";
import { CategoryForm } from "./CategoryForm";
import { deleteCategory } from "@/lib/actions/categories";
import type { PlainCategory } from "@/lib/queries";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

function CategoryCard({ category }: { category: PlainCategory }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const result = await deleteCategory(category._id);
    if (!result.success) setError(result.error);
  }

  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{category.name}</p>
          <p className="text-xs text-muted">
            {category.type === "income" ? "Ingreso" : "Gasto"}
            {category.budgetLimit ? ` · límite ${currency.format(category.budgetLimit)}/mes` : ""}
          </p>
          {error && <p className="mt-1 text-xs text-expense">{error}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => setEditing(true)} className="rounded-md p-1.5 text-muted hover:bg-surface-muted hover:text-foreground" aria-label="Editar">
          <Pencil size={15} />
        </button>
        <button onClick={handleDelete} className="rounded-md p-1.5 text-muted hover:bg-expense-soft hover:text-expense" aria-label="Eliminar">
          <Trash2 size={15} />
        </button>
      </div>
      {editing && (
        <Modal title="Editar categoría" onClose={() => setEditing(false)}>
          <CategoryForm category={category} onDone={() => setEditing(false)} />
        </Modal>
      )}
    </Card>
  );
}

export function CategoryList({ categories }: { categories: PlainCategory[] }) {
  const [creating, setCreating] = useState(false);
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus size={16} />
          Nueva categoría
        </Button>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted">Gastos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {expenseCategories.map((c) => (
            <CategoryCard key={c._id} category={c} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted">Ingresos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {incomeCategories.map((c) => (
            <CategoryCard key={c._id} category={c} />
          ))}
        </div>
      </section>

      {creating && (
        <Modal title="Nueva categoría" onClose={() => setCreating(false)}>
          <CategoryForm onDone={() => setCreating(false)} />
        </Modal>
      )}
    </div>
  );
}

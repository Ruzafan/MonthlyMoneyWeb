"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Modal, TransactionForm } from "./TransactionForm";
import { deleteTransaction } from "@/lib/actions/transactions";
import type { PlainCategory, PlainTransaction } from "@/lib/queries";

export function TransactionRowActions({
  transaction,
  categories,
  existingTags,
}: {
  transaction: PlainTransaction;
  categories: PlainCategory[];
  existingTags: string[];
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    await deleteTransaction(transaction._id);
    setDeleting(false);
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => setEditing(true)}
        className="rounded-md p-1.5 text-muted hover:bg-surface-muted hover:text-foreground"
        aria-label="Editar"
      >
        <Pencil size={15} />
      </button>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md p-1.5 text-muted hover:bg-expense-soft hover:text-expense disabled:opacity-50"
        aria-label="Eliminar"
      >
        <Trash2 size={15} />
      </button>
      {editing && (
        <Modal title="Editar movimiento" onClose={() => setEditing(false)}>
          <TransactionForm categories={categories} existingTags={existingTags} transaction={transaction} onDone={() => setEditing(false)} />
        </Modal>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, TransactionForm } from "./TransactionForm";
import type { PlainCategory } from "@/lib/queries";

export function NewTransactionButton({ categories, existingTags }: { categories: PlainCategory[]; existingTags: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Nuevo movimiento
      </Button>
      {open && (
        <Modal title="Nuevo movimiento" onClose={() => setOpen(false)}>
          <TransactionForm categories={categories} existingTags={existingTags} onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}

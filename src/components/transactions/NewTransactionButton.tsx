"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal, TransactionForm } from "./TransactionForm";
import type { PlainCategory } from "@/lib/queries";

export function NewTransactionButton({ categories }: { categories: PlainCategory[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Nuevo movimiento
      </Button>
      {open && (
        <Modal title="Nuevo movimiento" onClose={() => setOpen(false)}>
          <TransactionForm categories={categories} onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  );
}

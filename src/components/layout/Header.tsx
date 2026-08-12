import { NewTransactionButton } from "@/components/transactions/NewTransactionButton";
import type { PlainCategory } from "@/lib/queries";

export function Header({ title, subtitle, categories }: { title: string; subtitle?: string; categories: PlainCategory[] }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-6 py-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      <NewTransactionButton categories={categories} />
    </header>
  );
}

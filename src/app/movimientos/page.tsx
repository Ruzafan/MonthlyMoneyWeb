export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionRowActions } from "@/components/transactions/TransactionRowActions";
import { getAllTags, getCategories, getTransactions } from "@/lib/queries";

const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "short", year: "numeric" });

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; categoryId?: string; tag?: string; type?: "expense" | "income" }>;
}) {
  const filters = await searchParams;
  const [categories, tags, transactions] = await Promise.all([
    getCategories(),
    getAllTags(),
    getTransactions(filters),
  ]);
  const categoryById = new Map(categories.map((c) => [c._id, c]));

  return (
    <>
      <Header title="Movimientos" subtitle={`${transactions.length} movimiento${transactions.length === 1 ? "" : "s"}`} categories={categories} />
      <main className="flex-1 space-y-5 p-6">
        <Card className="p-4">
          <TransactionFilters categories={categories} tags={tags} />
        </Card>

        <Card className="overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted">No hay movimientos con estos filtros.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3">Categoría</th>
                    <th className="px-5 py-3">Descripción / tags</th>
                    <th className="px-5 py-3 text-right">Importe</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const category = categoryById.get(tx.categoryId);
                    return (
                      <tr key={tx._id} className="border-b border-border last:border-0 hover:bg-surface-muted/50">
                        <td className="whitespace-nowrap px-5 py-3 text-muted">{dateFmt.format(new Date(tx.date))}</td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category?.color }} />
                            {category?.name ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted">
                          {tx.description}
                          {tx.tags.length > 0 && (
                            <span className="ml-2 inline-flex flex-wrap gap-1">
                              {tx.tags.map((t) => (
                                <span key={t} className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted">
                                  {t}
                                </span>
                              ))}
                            </span>
                          )}
                        </td>
                        <td
                          className={`whitespace-nowrap px-5 py-3 text-right font-medium ${
                            tx.type === "income" ? "text-income" : "text-expense"
                          }`}
                        >
                          {tx.type === "income" ? "+" : "−"}
                          {currency.format(tx.amount)}
                        </td>
                        <td className="px-5 py-3">
                          <TransactionRowActions transaction={tx} categories={categories} existingTags={tags} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </>
  );
}

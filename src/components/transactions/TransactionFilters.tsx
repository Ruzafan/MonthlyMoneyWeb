"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, Input } from "@/components/ui/Input";
import type { PlainCategory } from "@/lib/queries";

export function TransactionFilters({
  categories,
  tags,
}: {
  categories: PlainCategory[];
  tags: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Desde</label>
        <Input type="date" defaultValue={params.get("from") ?? ""} onChange={(e) => setParam("from", e.target.value)} className="w-40" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Hasta</label>
        <Input type="date" defaultValue={params.get("to") ?? ""} onChange={(e) => setParam("to", e.target.value)} className="w-40" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Tipo</label>
        <Select defaultValue={params.get("type") ?? ""} onChange={(e) => setParam("type", e.target.value)} className="w-36">
          <option value="">Todos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-muted">Categoría</label>
        <Select
          defaultValue={params.get("categoryId") ?? ""}
          onChange={(e) => setParam("categoryId", e.target.value)}
          className="w-44"
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      {tags.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Tag</label>
          <Select defaultValue={params.get("tag") ?? ""} onChange={(e) => setParam("tag", e.target.value)} className="w-36">
            <option value="">Todos</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </div>
      )}
      {(params.get("from") || params.get("to") || params.get("type") || params.get("categoryId") || params.get("tag")) && (
        <button
          onClick={() => router.push(pathname)}
          className="h-10 rounded-lg px-3 text-sm font-medium text-muted hover:text-foreground"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

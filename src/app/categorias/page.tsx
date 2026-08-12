export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { CategoryList } from "@/components/categories/CategoryList";
import { getCategories } from "@/lib/queries";

export default async function CategoriasPage() {
  const categories = await getCategories();

  return (
    <>
      <Header title="Categorías" subtitle="Organiza tus movimientos y define límites de presupuesto" categories={categories} />
      <main className="flex-1 p-6">
        <CategoryList categories={categories} />
      </main>
    </>
  );
}

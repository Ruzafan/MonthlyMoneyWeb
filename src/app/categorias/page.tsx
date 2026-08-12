export const dynamic = "force-dynamic";

import { Header } from "@/components/layout/Header";
import { CategoryList } from "@/components/categories/CategoryList";
import { BackupControls } from "@/components/categories/BackupControls";
import { getCategories } from "@/lib/queries";

export default async function CategoriasPage() {
  const categories = await getCategories();

  return (
    <>
      <Header title="Categorías" subtitle="Organiza tus movimientos y define límites de presupuesto" categories={categories} />
      <main className="flex-1 space-y-5 p-6">
        <CategoryList categories={categories} />
        <BackupControls />
      </main>
    </>
  );
}

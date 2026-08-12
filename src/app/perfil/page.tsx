export const dynamic = "force-dynamic";

import Image from "next/image";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getCategories } from "@/lib/queries";
import { LogOut } from "lucide-react";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const categories = await getCategories();

  return (
    <>
      <Header title="Perfil" subtitle="Tu cuenta y los datos técnicos asociados" categories={categories} />
      <main className="flex-1 p-6">
        <Card className="max-w-lg p-6">
          <div className="flex items-center gap-4">
            {session.user.image ? (
              <Image src={session.user.image} alt="" width={56} height={56} className="h-14 w-14 rounded-full object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-lg font-medium">
                {session.user.name?.[0] ?? "?"}
              </div>
            )}
            <div>
              <p className="font-medium">{session.user.name}</p>
              <p className="text-sm text-muted">{session.user.email}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-medium text-muted">ID de usuario interno</p>
            <p className="mt-1 break-all rounded-lg bg-surface-muted px-3 py-2 font-mono text-sm">{session.user.id}</p>
            <p className="mt-2 text-xs text-muted">
              Es el identificador con el que se guardan tus categorías y movimientos en la base de datos. No se comparte con nadie.
            </p>
          </div>

          <form
            className="mt-6 border-t border-border pt-5"
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="secondary">
              <LogOut size={16} />
              Cerrar sesión
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
}

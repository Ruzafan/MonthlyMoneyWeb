import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { NewTransactionButton } from "@/components/transactions/NewTransactionButton";
import { getAllTags, type PlainCategory } from "@/lib/queries";

export async function Header({ title, subtitle, categories }: { title: string; subtitle?: string; categories: PlainCategory[] }) {
  const [session, existingTags] = await Promise.all([auth(), getAllTags()]);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-6 py-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <NewTransactionButton categories={categories} existingTags={existingTags} />
        {session?.user && (
          <Link
            href="/perfil"
            title={session.user.email ?? session.user.name ?? "Perfil"}
            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border transition-opacity hover:opacity-80"
          >
            {session.user.image ? (
              <Image src={session.user.image} alt="" width={40} height={40} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm font-medium">{session.user.name?.[0] ?? "?"}</span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}

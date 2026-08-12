"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, List, Tags, User, Wallet } from "lucide-react";

const links = [
  { href: "/", label: "Resumen", icon: LayoutDashboard },
  { href: "/movimientos", label: "Movimientos", icon: List },
  { href: "/categorias", label: "Categorías", icon: Tags },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Wallet size={18} />
        </div>
        <span className="text-lg font-semibold tracking-tight">Finanzas</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-muted hover:bg-surface-muted hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/perfil"
        className={clsx(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          pathname === "/perfil" ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface-muted hover:text-foreground"
        )}
      >
        <User size={18} />
        Perfil
      </Link>
    </aside>
  );
}

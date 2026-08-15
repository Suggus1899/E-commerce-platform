"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/hooks/useSession";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { authenticated, role, loading } = useSession();
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 flex flex-col md:flex-row gap-8">
      <aside className="md:w-56 flex-shrink-0">
        <nav className="flex md:flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded text-sm ${
                pathname === link.href ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        {loading ? (
          <p className="text-gray-400 text-sm">Cargando…</p>
        ) : authenticated && role !== "ADMIN" ? (
          <p className="text-red-600 font-medium">No tenés permisos de administrador.</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

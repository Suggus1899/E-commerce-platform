"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category } from "@/lib/types";
import AuthStatus from "./AuthStatus";
import CartLink from "./CartLink";

export default function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden relative">
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={() => setOpen((o) => !o)}
        className="p-2 flex flex-col gap-1"
      >
        <span className="block w-6 h-0.5 bg-gray-700" />
        <span className="block w-6 h-0.5 bg-gray-700" />
        <span className="block w-6 h-0.5 bg-gray-700" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex flex-col p-4 gap-3">
            <Link
              href="/categorias"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-900"
            >
              Categorías
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categorias/${c.slug}`}
                onClick={() => setOpen(false)}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                {c.name}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <CartLink />
              <AuthStatus />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

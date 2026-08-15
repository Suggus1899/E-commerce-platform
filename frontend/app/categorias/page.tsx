import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "Categorías - Mi Tienda",
  description: "Explorá todas las categorías y subcategorías de productos.",
};

export default async function CategoriesIndexPage() {
  const categories = await getCategories();
  const activeCategories = categories.filter((c) => c.active);
  const roots = activeCategories.filter((c) => c.parentId === null);
  const childrenOf = (parentId: string) => activeCategories.filter((c) => c.parentId === parentId);

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>

      {roots.length === 0 ? (
        <p className="text-gray-500">Todavía no hay categorías cargadas.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roots.map((root) => {
            const children = childrenOf(root.id);
            return (
              <div key={root.id} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-2">
                <Link
                  href={`/categorias/${root.slug}`}
                  className="text-lg font-semibold text-gray-900 hover:underline"
                >
                  {root.name}
                </Link>
                {children.length > 0 && (
                  <ul className="flex flex-col gap-1 pl-1">
                    {children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/categorias/${child.slug}`}
                          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

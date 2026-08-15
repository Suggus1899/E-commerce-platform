"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { ApiPage, Product } from "@/lib/types";

export default function AdminProductsPage() {
  const [page, setPage] = useState(0);
  const [data, setData] = useState<ApiPage<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products?page=${p}&size=20`);
      if (res.status === 403) {
        setError("No tenés permisos de administrador.");
        return;
      }
      if (!res.ok) {
        setError("No pudimos cargar los productos.");
        return;
      }
      setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      load(page);
    } else {
      alert("No se pudo eliminar el producto.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link href="/admin/productos/nuevo" className="bg-gray-900 text-white rounded px-4 py-2 text-sm">
          Nuevo producto
        </Link>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Cargando…</p>}

      {!loading && !error && data && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Precio</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Activo</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.content.map((p) => (
                  <tr key={p.id}>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.sku}</td>
                    <td className="px-3 py-2">${p.price.toFixed(2)}</td>
                    <td className="px-3 py-2">{p.stock}</td>
                    <td className="px-3 py-2">{p.active ? "Sí" : "No"}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-3">
                        <Link href={`/admin/productos/${p.id}`} className="text-blue-600 hover:underline">
                          Editar
                        </Link>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {data.content.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-gray-400">
                      No hay productos cargados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm disabled:text-gray-300"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">
              Página {data.number + 1} de {Math.max(data.totalPages, 1)}
            </span>
            <button
              disabled={page + 1 >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm disabled:text-gray-300"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}

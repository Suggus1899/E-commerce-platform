"use client";

import { use, useEffect, useState } from "react";
import ProductForm from "@/components/admin/ProductForm";
import type { Product } from "@/lib/types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/products/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          setError(res.status === 404 ? "Producto no encontrado." : "No se pudo cargar el producto.");
          return;
        }
        setProduct(await res.json());
      })
      .catch(() => setError("No se pudo cargar el producto."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-400 text-sm">Cargando…</p>;
  if (error || !product) return <p className="text-red-600">{error ?? "Producto no encontrado."}</p>;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
      <ProductForm product={product} />
    </div>
  );
}

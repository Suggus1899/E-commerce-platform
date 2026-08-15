"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { imageUrl } from "@/lib/api";
import type { Category, Product } from "@/lib/types";

interface AttributeRow {
  key: string;
  value: string;
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [salePrice, setSalePrice] = useState(product?.salePrice != null ? String(product.salePrice) : "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "0");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [onSale, setOnSale] = useState(product?.onSale ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);
  const [attributes, setAttributes] = useState<AttributeRow[]>(
    product ? Object.entries(product.attributes ?? {}).map(([key, value]) => ({ key, value })) : []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit-only side actions.
  const [stockInput, setStockInput] = useState(product?.stock?.toString() ?? "0");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  function addAttributeRow() {
    setAttributes((rows) => [...rows, { key: "", value: "" }]);
  }

  function updateAttribute(index: number, field: "key" | "value", value: string) {
    setAttributes((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeAttribute(index: number) {
    setAttributes((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const attributesObject = attributes.reduce<Record<string, string>>((acc, row) => {
      if (row.key.trim()) acc[row.key.trim()] = row.value;
      return acc;
    }, {});

    const payload = {
      name,
      description,
      sku,
      price: Number(price) || 0,
      salePrice: salePrice ? Number(salePrice) : null,
      stock: Number(stock) || 0,
      categoryId,
      attributes: attributesObject,
      featured,
      onSale,
      isNew,
    };

    try {
      const res = await fetch(isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          res.status === 403
            ? "No tenés permisos de administrador."
            : data?.message ?? "No se pudo guardar el producto."
        );
        return;
      }

      router.push("/admin/productos");
      router.refresh();
    } catch {
      setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateStock() {
    if (!product) return;
    const res = await fetch(`/api/admin/products/${product.id}/stock`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: Number(stockInput) || 0 }),
    });
    if (res.ok) {
      alert("Stock actualizado.");
    } else {
      alert("No se pudo actualizar el stock.");
    }
  }

  async function handleUploadImage() {
    if (!product || !file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/products/${product.id}/images`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const updated: Product = await res.json();
        setImages(updated.images ?? []);
        setFile(null);
      } else {
        alert("No se pudo subir la imagen.");
      }
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">SKU</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Categoría</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="">Seleccionar…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Precio</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Precio de oferta</label>
            <input
              type="number"
              step="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Stock inicial</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Destacado
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} /> En oferta
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} /> Nuevo
          </label>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Atributos</label>
            <button type="button" onClick={addAttributeRow} className="text-sm text-blue-600 hover:underline">
              + Agregar atributo
            </button>
          </div>
          {attributes.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                placeholder="Clave"
                value={row.key}
                onChange={(e) => updateAttribute(index, "key", e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
              />
              <input
                placeholder="Valor"
                value={row.value}
                onChange={(e) => updateAttribute(index, "value", e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-sm flex-1"
              />
              <button type="button" onClick={() => removeAttribute(index)} className="text-red-500 text-sm">
                Quitar
              </button>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start bg-gray-900 text-white rounded px-5 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
        </button>
      </form>

      {isEdit && product && (
        <div className="flex flex-col gap-6 border-t border-gray-200 pt-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-700">Imágenes</h2>
            <div className="flex gap-3 flex-wrap">
              {images.map((img) => (
                <img key={img} src={imageUrl(img)} alt={product.name} className="h-20 w-20 object-cover rounded border border-gray-200" />
              ))}
              {images.length === 0 && <p className="text-sm text-gray-400">Sin imágenes cargadas.</p>}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
              <button
                type="button"
                onClick={handleUploadImage}
                disabled={!file || uploadingImage}
                className="bg-gray-900 text-white rounded px-3 py-1.5 text-sm disabled:opacity-50"
              >
                {uploadingImage ? "Subiendo…" : "Subir imagen"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-700">Actualizar stock</h2>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={stockInput}
                onChange={(e) => setStockInput(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-32"
              />
              <button type="button" onClick={handleUpdateStock} className="bg-gray-900 text-white rounded px-3 py-1.5 text-sm">
                Actualizar stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

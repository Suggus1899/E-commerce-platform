"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParentId, setEditParentId] = useState("");
  const [editActive, setEditActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories");
      if (res.status === 403) {
        setError("No tenés permisos de administrador.");
        return;
      }
      if (!res.ok) {
        setError("No pudimos cargar las categorías.");
        return;
      }
      setCategories(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, parentId: parentId || null }),
      });
      if (res.ok) {
        setName("");
        setParentId("");
        load();
      } else {
        alert("No se pudo crear la categoría.");
      }
    } finally {
      setSaving(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditParentId(cat.parentId ?? "");
    setEditActive(cat.active);
  }

  async function saveEdit(id: string) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, parentId: editParentId || null, active: editActive }),
    });
    if (res.ok) {
      setEditingId(null);
      load();
    } else {
      alert("No se pudo guardar la categoría.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      load();
    } else {
      alert("No se pudo eliminar la categoría.");
    }
  }

  function parentName(id: string | null) {
    if (!id) return "—";
    return categories.find((c) => c.id === id)?.name ?? "—";
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Categoría padre</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="">(raíz)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={saving} className="bg-gray-900 text-white rounded px-4 py-2 text-sm disabled:opacity-50">
          Crear
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Cargando…</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-3 py-2">Nombre</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Padre</th>
                <th className="px-3 py-2">Activo</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id}>
                  {editingId === c.id ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        />
                      </td>
                      <td className="px-3 py-2 text-gray-400">{c.slug}</td>
                      <td className="px-3 py-2">
                        <select
                          value={editParentId}
                          onChange={(e) => setEditParentId(e.target.value)}
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="">(raíz)</option>
                          {categories
                            .filter((cat) => cat.id !== c.id)
                            .map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={editActive} onChange={(e) => setEditActive(e.target.checked)} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-3">
                          <button onClick={() => saveEdit(c.id)} className="text-blue-600 hover:underline">
                            Guardar
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-gray-500 hover:underline">
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2 text-gray-400">{c.slug}</td>
                      <td className="px-3 py-2">{parentName(c.parentId)}</td>
                      <td className="px-3 py-2">{c.active ? "Sí" : "No"}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-3">
                          <button onClick={() => startEdit(c)} className="text-blue-600 hover:underline">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-center text-gray-400">
                    No hay categorías cargadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

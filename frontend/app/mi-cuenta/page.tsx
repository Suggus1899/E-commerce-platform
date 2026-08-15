"use client";

import Link from "next/link";
import { useSession } from "@/hooks/useSession";

export default function MiCuentaPage() {
  const { authenticated, username, email, role, loading } = useSession();

  if (loading) {
    return <p className="mx-auto max-w-lg w-full px-4 py-12 text-gray-400 text-sm">Cargando…</p>;
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-lg w-full px-4 py-12 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>
        <p className="text-gray-600">Necesitás iniciar sesión para ver esta página.</p>
        <Link
          href="/login?redirect=/mi-cuenta"
          className="bg-gray-900 text-white rounded px-4 py-2 text-sm font-medium w-fit"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg w-full px-4 py-12 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>

      <dl className="grid grid-cols-[120px_1fr] gap-y-3 text-sm border border-gray-200 rounded-lg p-4">
        <dt className="text-gray-500">Usuario</dt>
        <dd className="text-gray-900">{username}</dd>
        <dt className="text-gray-500">Email</dt>
        <dd className="text-gray-900">{email}</dd>
        <dt className="text-gray-500">Rol</dt>
        <dd className="text-gray-900">{role === "ADMIN" ? "Administrador" : "Cliente"}</dd>
      </dl>

      {role === "ADMIN" && (
        <Link href="/admin" className="text-sm text-blue-600 hover:underline w-fit">
          Ir al panel de administración →
        </Link>
      )}

      <p className="text-xs text-gray-400">
        La edición de perfil y el cambio de contraseña todavía no están disponibles.
      </p>
    </div>
  );
}

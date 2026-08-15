"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

export default function AuthStatus() {
  const { authenticated, username, loading } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <span className="text-sm text-gray-400">…</span>;
  }

  if (!authenticated) {
    return (
      <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/mi-cuenta" className="text-gray-700 hover:text-gray-900 hover:underline">
        Hola, {username}
      </Link>
      <button type="button" onClick={handleLogout} className="text-gray-500 hover:text-gray-900 underline">
        Salir
      </button>
    </div>
  );
}

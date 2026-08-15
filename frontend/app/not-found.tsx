import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada - Mi Tienda",
  description: "La página que buscás no existe o fue movida.",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md w-full px-4 py-24 text-center flex flex-col items-center gap-4">
      <h1 className="text-5xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600">No encontramos la página que buscás.</p>
      <div className="flex items-center gap-4 pt-2">
        <Link href="/" className="bg-gray-900 text-white rounded px-4 py-2 text-sm font-medium">
          Volver al inicio
        </Link>
        <Link href="/categorias" className="text-sm text-gray-600 hover:text-gray-900 underline">
          Ver categorías
        </Link>
      </div>
    </div>
  );
}

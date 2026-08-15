import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import type { ApiPage, Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mi Tienda - Inicio",
  description: "Encontrá los mejores productos al mejor precio en Mi Tienda. Envíos a todo el país.",
};

export default async function Home() {
  const [featured, onSale, isNew] = await Promise.all([
    getProducts({ featured: true, size: 8 }),
    getProducts({ onSale: true, size: 8 }),
    getProducts({ isNew: true, size: 8 }),
  ]);

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 flex flex-col gap-12">
      <section className="rounded-xl bg-gray-900 text-white p-10 flex flex-col gap-3 bg-[url('/globe.svg')] bg-no-repeat bg-right bg-contain">
        <h1 className="text-3xl sm:text-4xl font-bold max-w-lg">Bienvenido a Mi Tienda</h1>
        <p className="text-gray-300 max-w-lg">
          Los mejores productos, al mejor precio, con envío a todo el país. Comprá online o
          consultanos directamente por WhatsApp.
        </p>
      </section>

      <ProductSection title="Destacados" page={featured} />
      <ProductSection title="Ofertas" page={onSale} />
      <ProductSection title="Nuevos ingresos" page={isNew} />
    </div>
  );
}

function ProductSection({ title, page }: { title: string; page: ApiPage<Product> }) {
  if (!page.content || page.content.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {page.content.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

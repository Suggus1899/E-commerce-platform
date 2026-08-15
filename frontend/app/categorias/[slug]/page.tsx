import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

type Props = PageProps<"/categorias/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  return {
    title: category ? `${category.name} - Mi Tienda` : "Categoría - Mi Tienda",
    description: category
      ? `Explorá los productos de la categoría ${category.name}.`
      : "Categoría no encontrada.",
  };
}

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <div className="mx-auto max-w-6xl w-full px-4 py-10">
        <p className="text-gray-600">No encontramos esa categoría.</p>
      </div>
    );
  }

  const minPrice = firstValue(sp.minPrice);
  const maxPrice = firstValue(sp.maxPrice);
  const page = Number(firstValue(sp.page) || "0") || 0;

  const result = await getProducts({
    categoryId: category.id,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    page,
    size: 20,
  });

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>

      {/* Native GET form so filtering works without any client-side JS. */}
      <form method="GET" className="flex flex-wrap items-end gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="minPrice" className="text-xs text-gray-500">
            Precio mínimo
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            defaultValue={minPrice}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="maxPrice" className="text-xs text-gray-500">
            Precio máximo
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            defaultValue={maxPrice}
            className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
          />
        </div>
        <button type="submit" className="bg-gray-900 text-white text-sm rounded px-4 py-2">
          Filtrar
        </button>
      </form>

      {result.content.length === 0 ? (
        <p className="text-gray-500">No hay productos en esta categoría por ahora.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {result.content.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <PageLink slug={slug} minPrice={minPrice} maxPrice={maxPrice} page={page - 1} disabled={page <= 0} label="Anterior" />
        <span className="text-sm text-gray-500">
          Página {result.number + 1} de {Math.max(result.totalPages, 1)}
        </span>
        <PageLink
          slug={slug}
          minPrice={minPrice}
          maxPrice={maxPrice}
          page={page + 1}
          disabled={page + 1 >= result.totalPages}
          label="Siguiente"
        />
      </div>
    </div>
  );
}

function PageLink({
  slug,
  minPrice,
  maxPrice,
  page,
  disabled,
  label,
}: {
  slug: string;
  minPrice: string;
  maxPrice: string;
  page: number;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return <span className="text-sm text-gray-300">{label}</span>;
  }

  const qs = new URLSearchParams();
  if (minPrice) qs.set("minPrice", minPrice);
  if (maxPrice) qs.set("maxPrice", maxPrice);
  qs.set("page", String(page));

  return (
    <Link href={`/categorias/${slug}?${qs.toString()}`} className="text-sm text-gray-700 hover:underline">
      {label}
    </Link>
  );
}

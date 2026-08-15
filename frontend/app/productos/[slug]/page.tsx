import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, imageUrl } from "@/lib/api";
import ProductGallery from "@/components/ProductGallery";
import ProductActions from "@/components/ProductActions";

type Props = PageProps<"/productos/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado - Mi Tienda" };
  }

  const description = product.description.slice(0, 150);

  return {
    title: `${product.name} - Mi Tienda`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: product.images.length > 0 ? [imageUrl(product.images[0])] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const showSale = product.onSale && product.salePrice != null;
  const attributeEntries = Object.entries(product.attributes ?? {});

  return (
    <div className="mx-auto max-w-6xl w-full px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      <ProductGallery images={product.images} name={product.name} />

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <p className="text-sm text-gray-400">SKU: {product.sku}</p>

        <div className="flex items-baseline gap-3">
          {showSale ? (
            <>
              <span className="text-gray-400 line-through text-lg">${product.price.toFixed(2)}</span>
              <span className="text-red-600 text-2xl font-bold">${product.salePrice!.toFixed(2)}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
          )}
        </div>

        <p className={product.stock > 0 ? "text-green-600 text-sm" : "text-red-600 text-sm font-medium"}>
          {product.stock > 0 ? `En stock (${product.stock} disponibles)` : "Sin stock"}
        </p>

        <p className="text-gray-600 whitespace-pre-line">{product.description}</p>

        {attributeEntries.length > 0 && (
          <table className="text-sm border border-gray-200 rounded overflow-hidden w-full max-w-sm">
            <tbody>
              {attributeEntries.map(([key, value]) => (
                <tr key={key} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 font-medium text-gray-500 bg-gray-50 w-1/2">{key}</td>
                  <td className="px-3 py-2 text-gray-700">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <ProductActions product={product} />
      </div>
    </div>
  );
}

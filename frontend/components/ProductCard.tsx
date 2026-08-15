import Link from "next/link";
import { imageUrl } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const hasImage = product.images && product.images.length > 0;
  const showSale = product.onSale && product.salePrice != null;

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
    >
      <div className="aspect-square w-full bg-gray-100 overflow-hidden">
        {hasImage ? (
          // Plain <img> per project convention (no next/image remote domain config).
          <img
            src={imageUrl(product.images[0])}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          {showSale ? (
            <>
              <span className="text-gray-400 line-through text-sm">${product.price.toFixed(2)}</span>
              <span className="text-red-600 font-semibold">${product.salePrice!.toFixed(2)}</span>
            </>
          ) : (
            <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
          )}
        </div>
        {product.stock === 0 && <span className="text-xs text-red-500">Sin stock</span>}
      </div>
    </Link>
  );
}

import { API_URL } from "./config";
import type { ApiPage, Category, Product } from "./types";

/**
 * Server-side fetchers for the PUBLIC catalog endpoints. These are called
 * directly from Server Components (never from the browser), so there is no
 * CORS concern and no need to proxy them through a Route Handler.
 */

export function imageUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path}`;
}

type ProductQuery = {
  categoryId?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  featured?: boolean;
  onSale?: boolean;
  isNew?: boolean;
  page?: number;
  size?: number;
  sort?: string;
};

export async function getProducts(query: ProductQuery = {}): Promise<ApiPage<Product>> {
  const qs = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    qs.set(key, String(value));
  });

  try {
    const res = await fetch(`${API_URL}/api/products?${qs.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return { content: [], totalElements: 0, totalPages: 0, number: 0, size: query.size ?? 20 };
    }
    return (await res.json()) as ApiPage<Product>;
  } catch {
    return { content: [], totalElements: 0, totalPages: 0, number: 0, size: query.size ?? 20 };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as Category[];
  } catch {
    return [];
  }
}

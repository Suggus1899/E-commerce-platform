import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/api";

// NOTE: update this to the real production domain when deploying.
const SITE_URL = "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, productsPage] = await Promise.all([
    getCategories(),
    getProducts({ size: 1000 }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date() },
    { url: `${SITE_URL}/categorias`, lastModified: new Date() },
    { url: `${SITE_URL}/carrito`, lastModified: new Date() },
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((c) => c.active)
    .map((c) => ({ url: `${SITE_URL}/categorias/${c.slug}`, lastModified: new Date() }));

  const productEntries: MetadataRoute.Sitemap = productsPage.content.map((p) => ({
    url: `${SITE_URL}/productos/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}

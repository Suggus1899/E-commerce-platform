import Link from "next/link";
import { getCategories } from "@/lib/api";
import AuthStatus from "./AuthStatus";
import CartLink from "./CartLink";
import MobileNav from "./MobileNav";

export default async function Header() {
  const categories = await getCategories();
  const mainCategories = categories.filter((c) => c.parentId === null && c.active);

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Mi Tienda
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm text-gray-600">
          <Link href="/categorias" className="hover:text-gray-900">
            Categorías
          </Link>
          {mainCategories.map((c) => (
            <Link key={c.id} href={`/categorias/${c.slug}`} className="hover:text-gray-900">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <CartLink />
          <AuthStatus />
        </div>

        <MobileNav categories={mainCategories} />
      </div>
    </header>
  );
}

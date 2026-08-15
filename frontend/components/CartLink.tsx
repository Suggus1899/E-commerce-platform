"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { CART_UPDATED_EVENT, resolveCartId } from "@/lib/cartClient";
import type { Cart } from "@/lib/types";

export default function CartLink() {
  const { authenticated, loading } = useSession();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (loading) return;
    const cartId = resolveCartId(authenticated);
    try {
      const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}`);
      if (!res.ok) return;
      const cart: Cart = await res.json();
      setCount(cart.items.reduce((sum, item) => sum + item.quantity, 0));
    } catch {
      // ignore network errors, keep last known count
    }
  }, [authenticated, loading]);

  useEffect(() => {
    refresh();
    window.addEventListener(CART_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(CART_UPDATED_EVENT, refresh);
  }, [refresh]);

  return (
    <Link href="/carrito" className="text-sm text-gray-600 hover:text-gray-900 inline-flex items-center gap-1.5">
      Carrito
      {count > 0 && (
        <span className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white text-xs w-5 h-5">
          {count}
        </span>
      )}
    </Link>
  );
}

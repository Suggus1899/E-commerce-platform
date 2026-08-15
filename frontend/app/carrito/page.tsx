"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/hooks/useSession";
import { CART_UPDATED_EVENT, dispatchCartUpdated, resolveCartId } from "@/lib/cartClient";
import { buildCartWhatsAppLink } from "@/lib/whatsapp";
import type { Cart } from "@/lib/types";

export default function CartPage() {
  const { authenticated, loading: sessionLoading } = useSession();
  const [cartId, setCartId] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCart = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cart/${encodeURIComponent(id)}`);
      const data = await res.json();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
    const id = resolveCartId(authenticated);
    setCartId(id);
    loadCart(id);
  }, [authenticated, sessionLoading, loadCart]);

  useEffect(() => {
    if (!cartId) return;
    const handler = () => loadCart(cartId);
    window.addEventListener(CART_UPDATED_EVENT, handler);
    return () => window.removeEventListener(CART_UPDATED_EVENT, handler);
  }, [cartId, loadCart]);

  async function updateQuantity(productId: string, quantity: number) {
    if (!cartId) return;
    await fetch(`/api/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(productId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    dispatchCartUpdated();
    loadCart(cartId);
  }

  async function removeItem(productId: string) {
    if (!cartId) return;
    await fetch(`/api/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(productId)}`, {
      method: "DELETE",
    });
    dispatchCartUpdated();
    loadCart(cartId);
  }

  if (sessionLoading || loading) {
    return <div className="mx-auto max-w-4xl w-full px-4 py-10 text-gray-500">Cargando carrito…</div>;
  }

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="text-gray-500">
          Tu carrito está vacío.{" "}
          <Link href="/" className="underline">
            Seguir comprando
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col divide-y divide-gray-200 border border-gray-200 rounded-lg">
            {items.map((item) => (
              <div key={item.productId} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="flex-1 min-w-[10rem]">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.price.toFixed(2)} c/u</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, Math.max(1, Number(e.target.value) || 1))}
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <p className="w-24 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <a
            href={buildCartWhatsAppLink(cart!)}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start bg-green-600 hover:bg-green-700 text-white rounded px-5 py-2.5 text-sm font-medium"
          >
            Finalizar por WhatsApp
          </a>
        </>
      )}
    </div>
  );
}

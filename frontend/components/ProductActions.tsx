"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { dispatchCartUpdated, resolveCartId } from "@/lib/cartClient";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type { Product } from "@/lib/types";

// Combines the quantity selector, "Agregar al carrito" button, and the
// WhatsApp checkout link in a single Client Component, since the spec's two
// buttons (AddToCartButton + WhatsApp link) need to share the same
// `quantity` state to build the correct WhatsApp message.
export default function ProductActions({ product }: { product: Product }) {
  const { authenticated, loading } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const router = useRouter();

  const outOfStock = product.stock <= 0;

  async function handleAdd() {
    if (loading || outOfStock) return;
    setStatus("saving");
    const cartId = resolveCartId(authenticated);
    const finalPrice = product.onSale && product.salePrice != null ? product.salePrice : product.price;

    try {
      const res = await fetch(`/api/cart/${encodeURIComponent(cartId)}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: product.name,
          quantity,
          price: finalPrice,
        }),
      });
      if (!res.ok) throw new Error("failed to add to cart");
      dispatchCartUpdated();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const whatsappLink = buildWhatsAppLink(product, quantity);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="quantity" className="text-sm text-gray-600">
          Cantidad
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          max={Math.max(product.stock, 1)}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          disabled={outOfStock}
          className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || status === "saving"}
          className="bg-gray-900 text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {outOfStock ? "Sin stock" : status === "saving" ? "Agregando…" : "Agregar al carrito"}
        </button>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 text-sm font-medium text-center"
        >
          Comprar por WhatsApp
        </a>
      </div>

      {status === "done" && (
        <p className="text-sm text-green-600">
          Producto agregado.{" "}
          <button type="button" onClick={() => router.push("/carrito")} className="underline">
            Ver carrito
          </button>
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">No pudimos agregar el producto. Intentá de nuevo.</p>
      )}
    </div>
  );
}

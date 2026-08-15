// Pure, side-effect-free helpers for building `wa.me` deep links. These
// intentionally never touch `window` so they work from both Server and
// Client Components and are trivially unit-testable.

export interface WhatsAppProduct {
  name: string;
  sku: string;
  price: number;
  salePrice: number | null;
  onSale: boolean;
}

export interface WhatsAppCartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface WhatsAppCart {
  items: WhatsAppCartItem[];
}

function resolveNumber(whatsappNumber?: string): string {
  return whatsappNumber ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
}

export function buildWhatsAppLink(
  product: WhatsAppProduct,
  quantity: number,
  whatsappNumber?: string
): string {
  const number = resolveNumber(whatsappNumber);
  const finalPrice = product.onSale && product.salePrice != null ? product.salePrice : product.price;
  const total = finalPrice * quantity;
  const text =
    `Hola! Quiero comprar:\n` +
    `- ${product.name} (código ${product.sku})\n` +
    `  Cantidad: ${quantity}\n` +
    `  Precio unitario: $${finalPrice}\n` +
    `  Total: $${total}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildCartWhatsAppLink(cart: WhatsAppCart, whatsappNumber?: string): string {
  const number = resolveNumber(whatsappNumber);
  const lines = cart.items.map((item) => {
    const subtotal = item.price * item.quantity;
    return (
      `- ${item.name}\n` +
      `  Cantidad: ${item.quantity}\n` +
      `  Precio unitario: $${item.price}\n` +
      `  Subtotal: $${subtotal.toFixed(2)}`
    );
  });
  const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const text =
    `Hola! Quiero finalizar mi compra:\n\n` +
    `${lines.join("\n\n")}\n\n` +
    `Total: $${total.toFixed(2)}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

import { NextRequest } from "next/server";
import { proxyJsonResponse } from "@/lib/serverProxy";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ cartId: string; productId: string }> }
) {
  const { cartId, productId } = await params;
  const body = await request.text();
  return proxyJsonResponse(`/api/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(productId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ cartId: string; productId: string }> }
) {
  const { cartId, productId } = await params;
  return proxyJsonResponse(`/api/cart/${encodeURIComponent(cartId)}/items/${encodeURIComponent(productId)}`, {
    method: "DELETE",
  });
}

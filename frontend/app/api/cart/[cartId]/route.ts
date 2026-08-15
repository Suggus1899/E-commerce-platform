import { NextRequest } from "next/server";
import { proxyJsonResponse } from "@/lib/serverProxy";

// `cartId` is either the literal "me" (authenticated user; requires the
// Bearer token, attached automatically by proxyJsonResponse from the
// httpOnly cookie) or a client-generated UUID for guests (no auth header is
// sent in that case because there is no cookie to read).
export async function GET(_request: NextRequest, { params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params;
  return proxyJsonResponse(`/api/cart/${encodeURIComponent(cartId)}`);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params;
  return proxyJsonResponse(`/api/cart/${encodeURIComponent(cartId)}`, { method: "DELETE" });
}

import { NextRequest } from "next/server";
import { proxyJsonResponse } from "@/lib/serverProxy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ cartId: string }> }) {
  const { cartId } = await params;
  const body = await request.text();
  return proxyJsonResponse(`/api/cart/${encodeURIComponent(cartId)}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

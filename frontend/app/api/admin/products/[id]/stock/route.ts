import { NextRequest } from "next/server";
import { proxyJsonResponse } from "@/lib/serverProxy";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.text();
  return proxyJsonResponse(`/api/admin/products/${id}/stock`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

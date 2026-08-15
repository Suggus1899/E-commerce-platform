import { NextRequest } from "next/server";
import { proxyJsonResponse } from "@/lib/serverProxy";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.text();
  return proxyJsonResponse(`/api/admin/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyJsonResponse(`/api/admin/categories/${id}`, { method: "DELETE" });
}

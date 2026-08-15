import { NextRequest } from "next/server";
import { proxyJsonResponse } from "@/lib/serverProxy";

export async function GET(request: NextRequest) {
  const qs = request.nextUrl.search; // includes leading "?" or is empty
  return proxyJsonResponse(`/api/admin/products${qs}`);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyJsonResponse("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

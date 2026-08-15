import { NextRequest } from "next/server";
import { proxyJsonResponse } from "@/lib/serverProxy";

export async function GET() {
  return proxyJsonResponse("/api/admin/categories");
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyJsonResponse("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

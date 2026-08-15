import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";

// Multipart uploads need special handling: we read the incoming FormData and
// re-send it as-is (fetch sets the correct multipart boundary automatically
// when given a FormData body), attaching the Bearer token from the httpOnly
// cookie.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const formData = await request.formData();

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/admin/products/${id}/images`, {
      method: "POST",
      headers,
      body: formData,
    });
  } catch {
    return NextResponse.json({ message: "No se pudo conectar con el servidor" }, { status: 502 });
  }

  const text = await res.text();
  if (!text) return new NextResponse(null, { status: res.status });

  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return new NextResponse(text, { status: res.status });
  }
}

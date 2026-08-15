import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "@/lib/config";

// Reads the httpOnly auth cookie server-side and validates it against the
// backend on every call. The raw token is never returned to the client.
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }

  if (!res.ok) {
    cookieStore.delete("auth_token");
    return NextResponse.json({ authenticated: false });
  }

  const user = await res.json();
  return NextResponse.json({
    authenticated: true,
    username: user.username,
    email: user.email,
    role: user.role,
  });
}

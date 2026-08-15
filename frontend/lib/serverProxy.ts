import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_URL } from "./config";

/**
 * Forwards a request to the real backend (via the nginx gateway), attaching
 * the `Authorization: Bearer <token>` header read from the httpOnly
 * `auth_token` cookie when present. The client-side JS never sees the token;
 * only this server-side code does.
 */
export async function forwardToBackend(path: string, init: RequestInit = {}): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
}

/** Forwards a request and relays the backend's JSON body + status verbatim. */
export async function proxyJsonResponse(path: string, init: RequestInit = {}): Promise<NextResponse> {
  const res = await forwardToBackend(path, init);

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await res.text();
  if (!text) {
    return new NextResponse(null, { status: res.status });
  }

  try {
    return NextResponse.json(JSON.parse(text), { status: res.status });
  } catch {
    return new NextResponse(text, { status: res.status });
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: Next.js 16 renamed the `middleware.ts` file convention to
// `proxy.ts` (and the `middleware` export to `proxy`). This is the
// equivalent of the "middleware" described in the spec.
//
// This only gates the UX for `/admin/**` and `/mi-cuenta`: it redirects to
// `/login` when there's no `auth_token` cookie at all. It does NOT verify
// the ADMIN role (that can't be checked here since the JWT is opaque to the
// frontend) - the actual authorization check happens in each Java
// microservice when the admin Route Handlers forward the Bearer token.
// Non-admin authenticated users get past the `/admin` gate but see a
// "no permissions" message rendered by `app/admin/layout.tsx`.
export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mi-cuenta"],
};

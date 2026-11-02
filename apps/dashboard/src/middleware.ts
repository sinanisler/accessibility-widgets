import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_KEY = "muneer_token";
const PUBLIC = ["/login", "/preview.html"];

/** Signature is verified by the API; this only catches malformed or expired sessions early. */
function isExpired(jwt: string): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith("/_next") || pathname.startsWith("/favicon"))) {
    return NextResponse.next();
  }

  const rawToken = request.cookies.get(TOKEN_KEY)?.value;
  const token = rawToken && !isExpired(decodeURIComponent(rawToken)) ? rawToken : undefined;
  if (!token && !pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    const res = NextResponse.redirect(url);
    if (rawToken) res.cookies.delete(TOKEN_KEY);
    return res;
  }

  if (token && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|preview.html).*)"],
};

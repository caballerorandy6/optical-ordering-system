import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Chequeo optimista por cookie: la verificación real de sesión y rol
// se hace en el servidor en cada página y cada Server Action.
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const isLogin = request.nextUrl.pathname.startsWith("/login");

  if (!sessionCookie && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (sessionCookie && isLogin) {
    return NextResponse.redirect(new URL("/ordenes", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)).*)",
  ],
};

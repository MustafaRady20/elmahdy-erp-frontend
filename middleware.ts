import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const user = req.cookies.get("user")?.value;
  const { pathname } = req.nextUrl;

  console.log(user)
  const publicPaths = ["/login", "/", "/reset-password"];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
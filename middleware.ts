import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login", "/reset-password"];
  const empPaths = ["/attendance", "/rules"];

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const userCookie = req.cookies.get("user")?.value;

  if (!userCookie) {
    // return NextResponse.redirect(new URL("/login", req.url));
        return NextResponse.next();

  }

  let user: any;

  try {
    user = JSON.parse(userCookie);
  } catch (err) {
    // return NextResponse.redirect(new URL("/login", req.url));
        return NextResponse.next();

  }

  if (user.role === "manager") {
    return NextResponse.next();
  }

  if (empPaths.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/attendance", req.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};

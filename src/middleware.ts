export const runtime = "nodejs";

import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/api/auth",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (!req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)"],
};

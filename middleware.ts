import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const COOKIE = "pmp_session"
const PUBLIC = ["/login", "/api/auth/login", "/api/health", "/api/vps/ingest"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (
    PUBLIC.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/pmp-") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE)?.value
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "dev-pmp-secret-change-me",
    )
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const res = pathname.startsWith("/api/")
      ? NextResponse.json({ error: "unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", req.url))
    res.cookies.delete(COOKIE)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

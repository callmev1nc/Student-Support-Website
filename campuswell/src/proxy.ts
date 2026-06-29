import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Next.js 16 renamed the `middleware` file convention to `proxy` (v16.0.0).
// See node_modules/next/dist/docs/.../file-conventions/proxy.md and AGENTS.md.
export function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value

  const { pathname } = request.nextUrl

  const publicPaths = ["/login", "/register"]
  const isPublic = publicPaths.some((p) => pathname.startsWith(p))

  if (!sessionToken && !isPublic) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (sessionToken && isPublic) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

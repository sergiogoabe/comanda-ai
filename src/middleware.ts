import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (pathname === "/dashboard" && token?.establishmentId) {
      return NextResponse.redirect(
        new URL(`/estabelecimento/${token.establishmentId}`, req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/register") ||
          pathname.startsWith("/chat") ||
          pathname.startsWith("/cozinha") ||
          pathname.startsWith("/delivery") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/seed") ||
          pathname.startsWith("/api/chat") ||
          pathname.startsWith("/api/menu") ||
          pathname.startsWith("/api/establishments") ||
          pathname.startsWith("/api/orders")
        ) {
          return true;
        }

        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png).*)"],
};

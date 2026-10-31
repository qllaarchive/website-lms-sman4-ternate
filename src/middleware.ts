import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = req.nextUrl;
      if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return true;
      if (pathname === "/login" || pathname === "/") return true;
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/lms/:path*", "/api/sliders/:path*"],
};

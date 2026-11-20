import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";
import { canAccessAdminArea, canAccessSystemAdmin } from "@/lib/permissions/rbac";

const { auth } = NextAuth(authConfig);

const LEARNER_PROTECTED_PREFIXES = [
  "/dashboard",
  "/foundation",
  "/roadmap",
  "/placement-test",
  "/courses",
  "/lessons",
  "/practice",
  "/flashcards",
  "/exams",
  "/ai-tutor",
  "/analytics",
  "/offline-library",
  "/settings",
];

const SYSTEM_ADMIN_ONLY_PREFIXES = [
  "/admin/users",
  "/admin/ai-config",
  "/admin/settings",
  "/admin/audit-logs",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isLoggedIn = Boolean(session?.user?.id);
  const roles = session?.user?.roles ?? [];

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canAccessAdminArea(roles)) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }

    const isSystemOnly = SYSTEM_ADMIN_ONLY_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );
    if (isSystemOnly && !canAccessSystemAdmin(roles)) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }

    return NextResponse.next();
  }

  const isLearnerProtected = LEARNER_PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  if (isLearnerProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/foundation/:path*",
    "/roadmap/:path*",
    "/placement-test/:path*",
    "/courses/:path*",
    "/lessons/:path*",
    "/practice/:path*",
    "/flashcards/:path*",
    "/exams/:path*",
    "/ai-tutor/:path*",
    "/analytics/:path*",
    "/offline-library/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};

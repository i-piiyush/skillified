import { NextRequest, NextResponse } from "next/server";

export const proxy = (request: NextRequest) => {
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.includes("better-auth.session_token"));
  const path = request.nextUrl.pathname;

  const publicApis = [
   
    "/api/auth",
    "/api/save-n8n-data",
  ];
  const isPublicApi = publicApis.some((route) => path.startsWith(route));

  if (path.startsWith("/api") && !isPublicApi) {
    if (!hasSession) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in first." },
        { status: 401 },
      );
    }
  }

  const protectedRoutes = ["/test", "/dashboard","/onboarding"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
};
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

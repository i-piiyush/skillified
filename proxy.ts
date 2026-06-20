import { NextRequest, NextResponse } from "next/server";

export const proxy = (request: NextRequest) => {
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.includes("better-auth.session_token"));

  const path = request.nextUrl.pathname;

  const aiEnabled =
    process.env.NEXT_PUBLIC_AI_FEATURES_ENABLED === "true";

  // AI-gated frontend routes
  const aiProtectedRoutes = ["/test", "/onboarding/assessment"];

  // AI-gated APIs
  const aiProtectedApis = [
    "/api/generate-stacks",
    "/api/get-weak-topic",
    "/api/onboard-user",
    "/api/n8n",
    "/api/test",
  ];

  if (!aiEnabled) {
    const isAiRoute = aiProtectedRoutes.some((route) =>
      path.startsWith(route),
    );

    if (isAiRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const isAiApi = aiProtectedApis.some((route) =>
      path.startsWith(route),
    );

    if (isAiApi) {
      return NextResponse.json(
        {
          success: false,
          message:
            "n8n features are disabled in production. Run the project locally to access these features.",
        },
        { status: 403 },
      );
    }
  }

  const publicApis = [
    "/api/auth",
    "/api/n8n", 
  ];

  const isPublicApi = publicApis.some((route) =>
    path.startsWith(route),
  );

  if (path.startsWith("/api") && !isPublicApi) {
    if (!hasSession) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in first.",
        },
        { status: 401 },
      );
    }
  }

  const protectedRoutes = ["/test", "/dashboard", "/onboarding"];

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
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
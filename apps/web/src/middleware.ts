import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** Chỉ các route chủ đích — không match URL lỗi ngẫu nhiên (vd. /foo). */
const ERROR_ROUTE_STATUS: Record<string, number> = {
  "/forbidden": 403,
  "/500": 500,
  "/maintenance": 503,
};

function normalizePathname(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      const rest = pathname.slice(locale.length + 1);
      return rest.startsWith("/") ? rest : `/${rest}`;
    }
  }
  return pathname;
}

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  response.headers.set("x-url-path", request.nextUrl.pathname);

  const normalized = normalizePathname(request.nextUrl.pathname);
  const status = ERROR_ROUTE_STATUS[normalized];
  if (!status) {
    return response;
  }

  const headers = new Headers(response.headers);
  if (status === 503) {
    headers.set("Retry-After", "3600");
  }

  // Next.js 16: Response.status là read-only — tạo NextResponse mới.
  return new NextResponse(response.body, {
    status,
    headers,
  });
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

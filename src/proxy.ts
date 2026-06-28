import { type NextRequest, NextResponse } from "next/server";
import type { Locale } from "./lib/i18n";

const locales: Locale[] = ["en", "ja"];

export function proxy(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  if (pathname.match(/\.(svg|jpg|jpeg|png|gif|mp4|webp|ico)$/)) {
    return NextResponse.next();
  }
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  let localeFromCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (!localeFromCookie || (localeFromCookie !== "ja" && localeFromCookie !== "en"))
    localeFromCookie = "en";
  //nextjs.org/docs/messages/proxy-relative-urls
  if (!pathnameHasLocale) {
    if (pathname !== "/" && pathname !== "") {
      request.nextUrl.pathname = `/${localeFromCookie}/${pathname}`;
      return NextResponse.redirect(new URL(`/${localeFromCookie}/${pathname}`, request.url));
    } else if (pathname === "/" || pathname === "") {
      request.nextUrl.pathname = `/${localeFromCookie}`;
      return NextResponse.redirect(new URL(`/${localeFromCookie}`, request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    "/((?!api|_next).*)",
    // Optional: only run on root (/) URL
    // '/'
  ],
};

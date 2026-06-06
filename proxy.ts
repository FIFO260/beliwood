import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './lib/i18n-config';

function getLocale(request: NextRequest): string {
  const acceptLang = request.headers.get('accept-language') ?? '';
  for (const locale of locales) {
    if (acceptLang.toLowerCase().includes(locale)) return locale;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
  if (hasLocale) return NextResponse.next();

  const locale = getLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next|api|admin|favicon|uploads|logo|.*\\..*).*)'],
};

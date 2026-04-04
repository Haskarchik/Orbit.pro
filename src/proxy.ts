import { NextResponse, type NextRequest } from 'next/server';

const locales = ['en', 'ua'];
const defaultLocale = 'ua';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Check if the pathname already has a locale
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) return;

    // Redirect if there is no locale
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next, static, public)
        '/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|ico)).*)',
    ],
};

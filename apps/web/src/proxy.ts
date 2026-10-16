import { NextResponse, type NextRequest } from 'next/server';

// Language routing. Pages live under app/[lang]; Hebrew keeps the short URLs.
//   /map        → shows /he/map (or redirects to /ar/map, /en/map if the visitor picked that language)
//   /he/map     → redirects to /map (one address per page)
//   /ar/map     → shown as is
// The choice is remembered in the "lang" cookie, set by the language picker.
// Kept self-contained on purpose: proxy code shouldn't share modules with the app.

const LANGS = ['he', 'ar', 'en'];
const DEFAULT_LANG = 'he';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split('/')[1] ?? '';

  if (first === DEFAULT_LANG) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LANG.length + 1) || '/';
    return NextResponse.redirect(url);
  }
  if (LANGS.includes(first)) return NextResponse.next();

  const preferred = preferredLang(request);
  if (preferred !== DEFAULT_LANG) {
    const url = request.nextUrl.clone();
    url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.rewrite(new URL(`/${DEFAULT_LANG}${pathname === '/' ? '' : pathname}${search}`, request.url));
}

/** The visitor's saved choice; on a first visit, Arabic for browsers set to Arabic, otherwise Hebrew. */
function preferredLang(request: NextRequest): string {
  const saved = request.cookies.get('lang')?.value;
  if (saved && LANGS.includes(saved)) return saved;
  const accept = request.headers.get('accept-language')?.trim().toLowerCase() ?? '';
  return accept.startsWith('ar') ? 'ar' : DEFAULT_LANG;
}

export const config = {
  // Everything except Next internals, API routes and files (sw.js, icons, sitemap.xml...).
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};

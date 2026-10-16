import he from '@whats-poppin/shared/src/i18n/he.json';
import ar from '@whats-poppin/shared/src/i18n/ar.json';
import en from '@whats-poppin/shared/src/i18n/en.json';

// Every user-facing string lives in packages/shared/src/i18n/<lang>.json. Components never contain
// literals: client components read `t` from useI18n() (lib/i18n-client), server components from
// getI18n() (lib/i18n-server). Hebrew is the default and keeps the short URLs (/map); the other
// languages live under a prefix (/ar/map, /en/map).

export const LANGS = ['he', 'ar', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'he';
/** Cookie that remembers the visitor's choice (read by src/proxy.ts). */
export const LANG_COOKIE = 'lang';

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export function dirOf(lang: Lang): 'rtl' | 'ltr' {
  return lang === 'en' ? 'ltr' : 'rtl';
}

/** BCP 47 tag for <html lang>, Open Graph and Intl. */
export const LOCALE_TAG: Record<Lang, string> = { he: 'he-IL', ar: 'ar-IL', en: 'en-IL' };
/** For Intl number/date formatting. Western digits in every language, as is usual in Israel. */
export const INTL_LOCALE: Record<Lang, string> = { he: 'he-IL', ar: 'ar-IL-u-nu-latn', en: 'en-IL' };

type Dict = { [key: string]: string | string[] | Dict };
const DICTS: Record<Lang, Dict> = { he: he as unknown as Dict, ar: ar as unknown as Dict, en: en as unknown as Dict };

type Params = Record<string, string | number | undefined>;

function lookup(dict: Dict, key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node as Dict | undefined)?.[part], dict);
}

/** "/map" in Arabic → "/ar/map". Paths that already carry a language are left alone. */
export function localePath(lang: Lang, path: string): string {
  if (!path.startsWith('/') || path.startsWith('//')) return path;
  if (splitLangPath(path).lang !== null) return path;
  if (lang === DEFAULT_LANG) return path;
  return path === '/' ? `/${lang}` : `/${lang}${path.startsWith('/?') ? path.slice(1) : path}`;
}

/** "/ar/map?x=1" → { lang: 'ar', path: '/map?x=1' }; "/map" → { lang: null, path: '/map' }. */
export function splitLangPath(path: string): { lang: Lang | null; path: string } {
  const m = /^\/([a-z]{2})(?=$|[/?#])(.*)$/.exec(path);
  if (m && isLang(m[1])) {
    const rest = m[2] || '/';
    return { lang: m[1], path: rest.startsWith('/') ? rest : `/${rest}` };
  }
  return { lang: null, path };
}

export interface I18n {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  /** t('status.openUntil', { time: '22:00' }) → "פתוח עכשיו · עד 22:00" */
  t: (key: string, params?: Params) => string;
  /** For array values such as "weekdays". */
  tList: (key: string) => string[];
  /** Internal link in the current language. */
  href: (path: string) => string;
  /** City name in the current language; the database name when we don't have a translation. */
  city: (slug: string, fallback: string) => string;
  /** Chevron that points "forward" (left in RTL, right in LTR). */
  forward: 'chevron-left' | 'chevron-right';
  /** Arrow that points "back" (right in RTL, left in LTR). */
  back: 'arrow-right' | 'arrow-left';
}

const cache = new Map<Lang, I18n>();

export function getTranslator(lang: Lang): I18n {
  const hit = cache.get(lang);
  if (hit) return hit;
  const dict = DICTS[lang];
  const fallback = DICTS[DEFAULT_LANG];
  const raw = (key: string) => {
    const v = lookup(dict, key);
    return v === undefined ? lookup(fallback, key) : v;
  };
  const t = (key: string, params?: Params) => {
    const value = raw(key);
    if (typeof value !== 'string') return key;
    if (!params) return value;
    return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(params[name] ?? ''));
  };
  const rtl = dirOf(lang) === 'rtl';
  const i18n: I18n = {
    lang,
    dir: dirOf(lang),
    t,
    tList: (key) => {
      const value = raw(key);
      return Array.isArray(value) ? value : [];
    },
    href: (path) => localePath(lang, path),
    city: (slug, fallbackName) => {
      const value = lookup(dict, `cities.${slug}`);
      return typeof value === 'string' ? value : fallbackName;
    },
    forward: rtl ? 'chevron-left' : 'chevron-right',
    back: rtl ? 'arrow-right' : 'arrow-left',
  };
  cache.set(lang, i18n);
  return i18n;
}

/** Each language's own name, shown in the language picker. */
export const LANG_NAMES: Record<Lang, string> = { he: 'עברית', ar: 'العربية', en: 'English' };

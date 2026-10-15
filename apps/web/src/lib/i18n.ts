import he from '@whats-poppin/shared/src/i18n/he.json';

// Hebrew is the only UI language at launch. To add one: add packages/shared/src/i18n/<lang>.json
// and pick the dictionary by locale here. Components never contain user-facing literals.
type Dict = { [key: string]: string | string[] | Dict };
const dict = he as unknown as Dict;

type Params = Record<string, string | number | undefined>;

function lookup(key: string): unknown {
  return key.split('.').reduce<unknown>((node, part) => (node as Dict | undefined)?.[part], dict);
}

/** t('status.openUntil', { time: '22:00' }) → "פתוח עכשיו · עד 22:00" */
export function t(key: string, params?: Params): string {
  const value = lookup(key);
  if (typeof value !== 'string') return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(params[name] ?? ''));
}

/** For array values such as "weekdays". */
export function tList(key: string): string[] {
  const value = lookup(key);
  return Array.isArray(value) ? value : [];
}

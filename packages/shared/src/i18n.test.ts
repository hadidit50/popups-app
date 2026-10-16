import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Every language must have exactly the same keys, list lengths and {{placeholders}} as Hebrew,
// so no screen ever shows a raw key or loses a value.
const load = (lang: string) => JSON.parse(readFileSync(new URL(`./i18n/${lang}.json`, import.meta.url), 'utf8'));
type Node = string | string[] | { [k: string]: Node };

function flatten(node: Node, prefix = ''): Map<string, string | string[]> {
  const out = new Map<string, string | string[]>();
  if (typeof node === 'string' || Array.isArray(node)) {
    out.set(prefix, node);
    return out;
  }
  for (const [k, v] of Object.entries(node)) for (const [kk, vv] of flatten(v, prefix ? `${prefix}.${k}` : k)) out.set(kk, vv);
  return out;
}

const placeholders = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort().join(',');
const he = flatten(load('he'));

for (const lang of ['ar', 'en']) {
  test(`${lang}.json matches he.json`, () => {
    const other = flatten(load(lang));
    assert.deepEqual([...other.keys()].sort(), [...he.keys()].sort());
    for (const [key, value] of he) {
      const v = other.get(key)!;
      if (Array.isArray(value)) {
        assert.ok(Array.isArray(v) && v.length === value.length, `${lang}: ${key} list length`);
      } else {
        assert.equal(typeof v, 'string', `${lang}: ${key} type`);
        assert.ok((v as string).trim().length > 0, `${lang}: ${key} is empty`);
        assert.equal(placeholders(v as string), placeholders(value), `${lang}: ${key} placeholders`);
      }
    }
  });
}

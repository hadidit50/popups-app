import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// Legal documents: well-formed, versioned, and using the agreed terms. "משתמש" (user) is banned:
// the documents and the Hebrew UI speak only of "גולש" (visitor) and "מפרסם" (advertiser).
const dir = new URL('./legal/docs/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
const read = (f: string) => JSON.parse(readFileSync(new URL(f, dir), 'utf8'));

test('every legal document file is named <doc>.v<version>.<lang>.json and matches its content', () => {
  assert.ok(files.length > 0);
  for (const f of files) {
    const m = /^(\w+)\.v(\d+)\.(he|ar|en)\.json$/.exec(f);
    assert.ok(m, f);
    const d = read(f);
    assert.equal(d.doc, m[1], f);
    assert.equal(d.version, Number(m[2]), f);
    assert.equal(d.lang, m[3], f);
    assert.match(d.updated, /^\d{4}-\d{2}-\d{2}$/, f);
    assert.ok(d.title, f);
    if (d.sections) {
      assert.ok(d.summary.length >= 5 && d.summary.length <= 7, `${f}: "in short" has 5–7 lines`);
      assert.equal(d.sections[0].id, 'definitions', `${f}: starts with definitions`);
      const ids = d.sections.map((s: { id: string }) => s.id);
      assert.equal(new Set(ids).size, ids.length, `${f}: unique section ids`);
    } else {
      assert.ok(Array.isArray(d.legacyBody), f);
    }
  }
});

test('the newest Hebrew documents never use the word "משתמש"', () => {
  for (const f of files.filter((f) => f.endsWith('.he.json'))) {
    const d = read(f);
    if (!d.sections) continue; // archived v1 texts stay exactly as they were published
    assert.doesNotMatch(JSON.stringify(d), /משתמש/, f);
  }
});

test('the Hebrew interface never uses the word "משתמש"', () => {
  const he = readFileSync(new URL('./i18n/he.json', import.meta.url), 'utf8');
  assert.doesNotMatch(he, /משתמש/);
});

// MapLibre 6 loads its web worker from a separate file. Copy it into public/ before dev/build so it
// always matches the installed version (public/vendor is git-ignored).
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const pkgDir = dirname(require.resolve('maplibre-gl/package.json'));
const out = join(import.meta.dirname, '..', 'public', 'vendor');
mkdirSync(out, { recursive: true });
copyFileSync(join(pkgDir, 'dist', 'maplibre-gl-worker.mjs'), join(out, 'maplibre-gl-worker.mjs'));
console.log('copied maplibre-gl-worker.mjs');

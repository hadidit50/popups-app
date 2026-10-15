#!/usr/bin/env python3
"""Generates packages/shared/src/demo-data.ts from supabase/seed.sql.

The site runs in "demo mode" (built-in sample pop-ups) until Supabase is connected. Generating the
demo copy from the seed keeps both identical. Run via `npm run db:setup-file`.
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
seed = (ROOT / 'supabase' / 'seed.sql').read_text(encoding='utf-8')

def parse_args(s):
    """Parses a SQL argument list: 'text', numbers, true/false/null, pg_temp.d(N, 'HH:MM'), array[...]."""
    args, i = [], 0
    while i < len(s):
        c = s[i]
        if c in ' \n\t,':
            i += 1; continue
        if c == "'":
            j, buf = i + 1, []
            while True:
                if s[j] == "'" and j + 1 < len(s) and s[j + 1] == "'":
                    buf.append("'"); j += 2
                elif s[j] == "'":
                    break
                else:
                    buf.append(s[j]); j += 1
            args.append(''.join(buf)); i = j + 1
        elif s.startswith('pg_temp.d(', i):
            j = s.index(')', i)
            n, t = parse_args(s[i + len('pg_temp.d('):j])
            args.append({'days': int(n), 'time': t}); i = j + 1
        elif s.startswith('array[', i):
            j = s.index(']', i)
            args.append([int(x) for x in s[i + 6:j].split(',')]); i = j + 1
        else:
            m = re.match(r"[-\w.]+", s[i:])
            tok = m.group(0); i += len(tok)
            if tok == 'true': args.append(True)
            elif tok == 'false': args.append(False)
            elif tok == 'null': args.append(None)
            else: args.append(float(tok) if '.' in tok else int(tok))
    return args

def calls(name):
    out = []
    for m in re.finditer(r"select pg_temp\.%s\((.*?)\);\n" % name, seed, re.S):
        out.append(parse_args(m.group(1)))
    return out

cities = {}
for m in re.finditer(r"\('([a-z-]+)',\s*'IL', '([^']*(?:''[^']*)*)',\s*'([^']*(?:''[^']*)*)',\s*'SRID=4326;POINT\(([\d.]+) ([\d.]+)\)'", seed):
    cities[m.group(1)] = {'name_he': m.group(2).replace("''", "'"), 'name_en': m.group(3).replace("''", "'")}

popups = []
for a in calls('add_popup'):
    keys = ['slug', 'title', 'short_description', 'description', 'category', 'city_slug', 'address', 'lng', 'lat',
            'starts', 'ends', 'price_range', 'wheelchair_accessible', 'parking_available', 'kid_friendly',
            'instagram_url', 'image', 'image2', 'created_days_ago']
    p = dict(zip(keys, a))
    p.setdefault('image2', None)
    p['hours'] = []
    popups.append(p)
by_slug = {p['slug']: p for p in popups}
for slug, days, opens, closes in calls('hours'):
    for d in days:
        by_slug[slug]['hours'].append({'weekday': d, 'opens': opens, 'closes': closes})

pending = re.findall(r"update public\.popups set status = 'pending'.*? where slug = '([^']+)'", seed)
promos = [{'slug': s, 'placement': pl} for s, pl in re.findall(r"\('([a-z0-9-]+)', '(\w+)'::public\.promotion_placement", seed)]
activity = {s: {'views': int(v), 'saves': int(sv), 'navigations': int(n)} for s, v, sv, n in
            re.findall(r"\('([a-z0-9-]+)', (\d+), (\d+), (\d+)\)", seed)}

for p in popups:
    p['status'] = 'pending' if p['slug'] in pending else 'approved'

assert len(popups) >= 25, len(popups)
out = ROOT / 'packages' / 'shared' / 'src' / 'demo-data.ts'
out.write_text(
    '// GENERATED from supabase/seed.sql by packages/shared/scripts/gen-demo-data.py — do not edit by hand.\n'
    '/* eslint-disable */\n'
    'export const DEMO_CITIES = ' + json.dumps(cities, ensure_ascii=False, indent=2) + ' as const;\n\n'
    'export const DEMO_SEED = ' + json.dumps(popups, ensure_ascii=False, indent=2) + ';\n\n'
    'export const DEMO_PROMOTIONS = ' + json.dumps(promos, ensure_ascii=False, indent=2) + ';\n\n'
    'export const DEMO_ACTIVITY: Record<string, { views: number; saves: number; navigations: number }> = '
    + json.dumps(activity, ensure_ascii=False, indent=2) + ';\n',
    encoding='utf-8')
print(f'wrote {out} ({len(popups)} pop-ups, {len(promos)} promotions)')

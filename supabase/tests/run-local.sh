#!/usr/bin/env bash
# Applies all migrations + seed to a throwaway local Postgres/PostGIS and runs the SQL tests.
# For CI / quick checks without Docker. With Docker you can use `supabase db reset` + `supabase test db` instead.
#
# Requires: PostgreSQL 15+ server binaries and PostGIS installed locally.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PG_BIN="${PG_BIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
PORT="${PGTEST_PORT:-55432}"
WORK="$(mktemp -d)"
RUN_AS=()
if [ "$(id -u)" = "0" ]; then
  chown postgres "$WORK"
  RUN_AS=(runuser -u postgres --)
fi

cleanup() {
  "${RUN_AS[@]}" "$PG_BIN/pg_ctl" -D "$WORK/data" stop -m fast >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

"${RUN_AS[@]}" "$PG_BIN/initdb" -D "$WORK/data" -U postgres -A trust >/dev/null
"${RUN_AS[@]}" "$PG_BIN/pg_ctl" -D "$WORK/data" -o "-p $PORT -k $WORK -c listen_addresses=''" -l "$WORK/log" start >/dev/null

PSQL=(psql -h "$WORK" -p "$PORT" -U postgres -v ON_ERROR_STOP=1 -q -X)
"${PSQL[@]}" -d postgres -c "create database app"
"${PSQL[@]}" -d postgres -c "alter database app set search_path = \"\$user\", public, extensions"
"${PSQL[@]}" -d app -c "alter database app set timezone = 'UTC'"

echo "→ shim"
"${PSQL[@]}" -d app -f "$ROOT/supabase/tests/local_shim.sql"
# Test exactly what people paste into the SQL Editor, and make sure it's up to date.
EXPECTED="$(mktemp)"
cp "$ROOT/supabase/setup.sql" "$EXPECTED"
bash "$ROOT/supabase/build-setup.sh" >/dev/null
if ! diff -q "$EXPECTED" "$ROOT/supabase/setup.sql" >/dev/null; then
  echo "✗ supabase/setup.sql was out of date — it has been regenerated, commit it." >&2
  exit 1
fi
echo "→ setup.sql (migrations + seed)"
"${PSQL[@]}" -d app -f "$ROOT/supabase/setup.sql" >/dev/null
for f in "$ROOT"/supabase/tests/*.test.sql; do
  echo "→ $(basename "$f")"
  "${PSQL[@]}" -d app -f "$f" >/dev/null
done
echo "✓ all database checks passed"

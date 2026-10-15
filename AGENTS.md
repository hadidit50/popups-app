# WHATS POPPIN — notes for contributors and coding agents

**#1 principle: user-friendliness above everything.** If a change makes the app more confusing, simplify it or cut it.

## Rules
- The product is the **website** in `apps/web` (Next.js 16, App Router, Cache Components). `apps/mobile` (Expo) is parked and not in the npm workspaces.
- Every user-facing string lives in `packages/shared/src/i18n/he.json` (Hebrew first), read via `t()` from `apps/web/src/lib/i18n.ts`. No literals in components.
- The site is always RTL (`<html dir="rtl">`). Use logical CSS (`inset-inline-start`, `margin-inline`, `padding-inline`), never left/right. "Forward" chevrons use `FORWARD_CHEVRON`.
- Colors/sizes come from the CSS tokens in `apps/web/src/app/globals.css`. Keep WCAG AA contrast. Font sizes in rem, never below 15px.
- Every interactive element is a real `<button>`/`<a>`, at least 48×48 (`var(--touch)`), with an accessible name.
- Anything time-dependent ("open now") is computed on the client from the visitor's clock (`useNow`), never during prerender.
- Every list screen needs loading (skeleton), empty and error states that tell the user what to do next.
- Status wording ("Open now", "Ends in 2 days") comes only from `packages/shared/src/status.ts`; the SQL `popup_is_open_at` must stay consistent with it.
- Sponsored items must always render `SponsoredTag`.
- Country/city/timezone are data. Never hard-code Israel outside seed data and defaults.

## Commands
- `npm test` — shared unit tests · `npm run typecheck` · `npm run build` — web build · `npm run db:test` — setup.sql + SQL tests on a local Postgres/PostGIS
- After changing a migration or the seed: `npm run db:setup-file` (regenerates `supabase/setup.sql`, the one-file setup people paste into the SQL Editor).
- Next.js 16 differs from older versions: read `node_modules/next/dist/docs/` before using an API.

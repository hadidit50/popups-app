# WHATS POPPIN — notes for contributors and coding agents

**#1 principle: user-friendliness above everything.** If a change makes the app more confusing, simplify it or cut it.

## Rules
- The product is the **website** in `apps/web` (Next.js 16, App Router, Cache Components). `apps/mobile` (Expo) is parked and not in the npm workspaces.
- The site speaks Hebrew (default, short URLs like `/map`), Arabic (`/ar/map`) and English (`/en/map`). Pages live under `app/[lang]`; `src/proxy.ts` maps the short Hebrew URLs and remembers the visitor's choice (cookie `lang`).
- Every user-facing string lives in `packages/shared/src/i18n/{he,ar,en}.json` (same keys in all three; `npm test` checks it). Client components: `const { t } = useI18n()` (`lib/i18n-client`). Server components: `const { t } = await getI18n()` (`lib/i18n-server`). No literals in components.
- Internal links use `Link`/`ButtonLink` from `@/components` and `useLocalRouter()`, which keep the visitor in their language. Never import `next/link` directly.
- Hebrew and Arabic are RTL, English is LTR. Use logical CSS (`inset-inline-start`, `margin-inline`, `padding-inline`), never left/right. Directional icons come from `useI18n()` (`forward`, `back`).
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

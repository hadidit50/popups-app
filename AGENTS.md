# WHATS POPPIN — notes for contributors and coding agents

**#1 principle: user-friendliness above everything.** If a change makes the app more confusing, simplify it or cut it.

## Rules
- Every user-facing string lives in `apps/mobile/src/i18n/locales/*.json` (Hebrew first). No literals in components.
- The app is always RTL. Use `start`/`end` (not `left`/`right`) for positioning; directional icons via `forwardChevron()`.
- All text goes through `AppText`; all tappables through `Touchable` (48px minimum, required `accessibilityLabel`).
- Colors/sizes come from `apps/mobile/src/ui/theme.ts`. Keep WCAG AA contrast.
- Every list screen needs loading (skeleton), empty and error states that tell the user what to do next.
- Status wording ("Open now", "Ends in 2 days") comes only from `packages/shared/src/status.ts`; the SQL `popup_is_open_at` must stay consistent with it.
- Sponsored items must always render `SponsoredTag`.
- Country/city/timezone are data. Never hard-code Israel outside seed data and defaults.

## Commands
- `npm test` — shared unit tests · `npm run typecheck` · `npm run db:test` — migrations + seed + SQL tests on a local Postgres/PostGIS
- In `apps/mobile`: use `npx expo install <pkg>` (not npm install) for native packages so versions match the Expo SDK.
- Expo changes between SDKs: check the docs for the SDK version in `apps/mobile/package.json` before using an API.

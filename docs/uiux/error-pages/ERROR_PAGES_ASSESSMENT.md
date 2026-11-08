# Error Pages — Assessment

**Date:** 2026-03-24  
**App:** `apps/web` (Next.js App Router, next-intl)

## Before

- Minimal `HttpStatusPage` (text-only, no illustration, single language block).
- No dedicated EdTech visual language.
- Explicit routes `/forbidden`, `/500`, `/maintenance` returned HTTP 200.
- Root `not-found` redirected away (no stable 404 UX).
- `global-error` exposed error digest.

## After (scope of redesign)

- Shared **Friendly Academic – Modern Gamified EdTech** layout aligned with portal tokens (`globals.css`, Plus Jakarta / Inter).
- Per-status SVG illustrations (404 / 403 / 500 / 503).
- Bilingual pattern: English headline + body; Vietnamese explanation (`lang="vi"`).
- Learning shortcuts on 404 (Grammar, Exams, Dashboard).
- Middleware sets HTTP **403 / 500 / 503** on dedicated routes; `not-found` remains framework **404**.

## Router & i18n

- All portal errors under `app/[locale]/…`.
- Route group `(errors)` without portal header/footer.
- `localePrefix: as-needed` (default `vi`).

## Out of scope

- Changing Laravel/API exception handling.
- Maintenance mode toggle via env (documented hook only: visit `/maintenance`).
- `error.tsx` boundary still serves runtime errors; response may be **200** at document level (Next.js limitation — noted in test results).

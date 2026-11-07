# UI/UX Testing Report (Phase 5)

**Date:** 2026-11-07  
**Scope:** Login UI, mock timer, Phase 4 pages regression spot-check  
**Environment:** Windows, Laragon, `apps/web` Next.js 16.4.5

## Automated

| Check | Result | Notes |
|-------|--------|-------|
| `npm run build` | **Pass** | 86 static paths; includes `/mock-exams/session/[slug]`, `/login`, `/profile`, `/analytics` |
| `npm run lint` | **Pass** | 0 errors (2026-11-07: `useSyncExternalStore` hooks for stats/token/theme); occasional `no-unused-vars` warnings only |

## Viewports (manual — agent smoke)

Not run in real browsers at 375 / 768 / 1280 in this pass. **Recommended for you:** resize DevTools on `/login`, `/mock-exams`, `/grammar/present-simple` quiz.

## Manual flows checklist

| Flow | Status | Notes |
|------|--------|-------|
| Grammar hub / tense detail (no login) | Not exercised this session | SSG paths present in build output |
| Quiz focus + results | Not exercised this session | |
| Login UI (Google + dev) | **Code complete** | shadcn Card; dev → `/exams` |
| Auth callback | **Code complete** | Card + Alert states |
| Exams catalog + detail | Not exercised this session | |
| Mock registration form | Not exercised this session | API requires `scheduled_at` in future |
| **Timed mock** | **New** | `/mock-exams` → Start → `/mock-exams/session/{slug}`; countdown + auto-submit via `ExamClient` ref |
| Profile sync | Not exercised this session | |
| Locale `vi` / `en` | Not exercised this session | |
| Dark mode | Not exercised this session | `ThemeInit` unchanged |

## Accessibility

- No axe run in this pass.
- Quiz / exam use `RadioGroup` + `Label` htmlFor (keyboard focus on radios expected; not verified).

## Known issues / deferrals

1. **ESLint `set-state-in-effect`** — project-wide on client components reading `localStorage`.
2. **Mock timer** — duration from “Start timed” form; reopening expired session falls back to API `duration_minutes`.
3. **Mock registration list** — depends on Sanctum + paginated `GET /mock-registrations`.
4. **Middleware → proxy** — Next 16 deprecation warning on build.
5. **Full proctoring / section timers** — not implemented (only single session countdown).

## Sign-off

Phase 5 **partial**: build green; lint red on stylistic hook rule; manual QA **pending human pass** on Laragon URLs.

# Error Pages — Implementation

## Created

- `apps/web/src/components/errors/error-illustrations.tsx`
- `apps/web/src/components/errors/error-learning-shortcuts.tsx`
- `apps/web/src/lib/error-page-props.ts`
- `apps/web/src/app/[locale]/(errors)/maintenance/maintenance-page-client.tsx`
- `docs/uiux/error-pages/*.md`

## Modified

- `apps/web/src/components/errors/http-status-page.tsx` — full redesign
- `apps/web/src/components/errors/http-status-page-i18n.tsx`
- `apps/web/src/lib/error-page-copy.ts`
- `apps/web/messages/en.json`, `vi.json` — `errors` namespace
- `apps/web/src/middleware.ts` — HTTP status on `/forbidden`, `/500`, `/maintenance`
- `apps/web/src/app/[locale]/not-found.tsx`, `error.tsx`
- `apps/web/src/app/[locale]/(errors)/*/page.tsx`
- `apps/web/src/app/global-error.tsx`, `app/not-found.tsx`
- `apps/web/src/components/admin/admin-auth-gate.tsx`

## HTTP handling

| Case | Mechanism |
|------|-----------|
| 404 | `not-found.tsx` + `notFound()` |
| 403 route | `/forbidden` + middleware `403` |
| 403 admin | `HttpStatusPageI18n` (no route change) |
| 500 route | `/500` + middleware `500` |
| 500 runtime | `[locale]/error.tsx` |
| 503 | `/maintenance` + middleware `503` + `Retry-After: 3600` |

## Components

- **`HttpStatusPage`** — presentational layout
- **`HttpStatusPageI18n`** — client + next-intl
- **`buildErrorPageProps`** — server pages

# Admin — SEO configuration

## Overview

SEO settings live in the Laravel API (`seo_global`, `seo_pages`) and are consumed by the Next.js app via `GET /api/v1/seo/resolve`. Admins manage content at **`/admin/content/seo`** (authenticated, `is_admin`).

## Data model

| Table | Purpose |
|-------|---------|
| `seo_global` | Single row (id=1): site name, defaults, OG, canonical base, robots defaults, organization fields for JSON-LD, `maintenance_noindex` |
| `seo_pages` | Overrides keyed by `route_key` + `locale` (`vi`, `en`, or `*`) |

Route keys come from `apps/api/config/seo_routes.php` (static pages + dynamic grammar tenses and published exams).

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/seo/resolve?path&locale` | Public |
| GET | `/api/v1/seo/sitemap-entries` | Public |
| GET | `/api/v1/seo/robots-rules` | Public |
| GET/PATCH | `/api/v1/admin/seo/global` | Admin |
| GET/PUT/DELETE | `/api/v1/admin/seo/pages/*` | Admin |
| GET | `/api/v1/admin/seo/registry`, `validate`, `preview` | Admin |

Resolve merges: global → page (`*` then locale) → page-specific defaults. Admin and auth routes are forced `noindex` via config deny list.

## Web runtime

- `apps/web/src/lib/seo-metadata.ts` — fetch resolve + map to Next `Metadata`
- `[locale]/layout.tsx` — `generateMetadata` for defaults
- Portal pages (home, grammar, exams) overlay translations when no DB override
- `app/robots.ts`, `app/sitemap.ts` — API-driven with static fallback
- `components/seo/seo-json-ld.tsx` — Organization, WebSite, LearningResource (grammar)

## Admin UI tabs

1. **Global** — default title/description/OG/organization
2. **Pages** — per `route_key` and locale
3. **Technical** — canonical base, robots defaults, maintenance noindex
4. **Preview** — Google + OG cards, hreflang read-only
5. **Validation** — duplicates, missing fields, OG warnings

## Sitemap admin

**Path:** `/admin/content/sitemap` (sidebar **Sitemap**, same admin auth as SEO).

| Area | Behavior |
|------|----------|
| **System pages** | Read-only list built from `seo_routes` registry + `resolveRouteKey` robots. Filter indexed vs excluded; excluded reasons: static `noindex` in registry, or `seo_pages.robots_index = false`. Quick **Allow/Block index** calls `PUT /api/v1/admin/seo/pages` with `robots_index`. |
| **Custom URLs** | CRUD on `seo_sitemap_urls`: path (`/…`) or absolute URL, optional locale (`vi` / `en` / both), optional `priority` and `changefreq`, `is_enabled`, `sort_order`. Merged into public sitemap after registry URLs. |
| **Overview** | Stats, canonical base, link to live `{canonical_base}/sitemap.xml`. |

### Sitemap API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/admin/sitemap/overview` | Admin |
| GET/POST/PATCH/DELETE | `/api/v1/admin/sitemap/custom` (+ `{id}`) | Admin |
| GET | `/api/v1/seo/sitemap-entries` | Public (includes custom URLs when enabled) |

Public entries may include `priority` and `changefreq` (custom URLs only). Next.js `app/sitemap.ts` maps them to `MetadataRoute.Sitemap`.

## Operations

- **Cache:** Next.js tags fetches with `seo` (~60s). Admin **Clear SEO cache** (or save/upload) calls `POST /api/v1/admin/seo/cache/clear` and `/api/admin/seo/revalidate` to refresh the learner portal immediately. Use the same control on **Sitemap** after changing custom URLs or page index flags.
- Set **`canonical_base`** (SEO → Technical) and **`NEXT_PUBLIC_SITE_URL`** (web) to the **frontend** origin. API fallback for sitemap/canonical is `FRONTEND_URL` in `apps/api/.env`, not `APP_URL`.
- **Favicon / site logo / OG / org logo:** URL or admin upload (`POST /api/v1/admin/seo/assets` → `storage/app/public/seo/*`). Run `php artisan storage:link` on the API app so `/storage/...` URLs work.

## Security

- Public resolve returns only public metadata (no drafts).
- `/admin/**` remains `noindex` in admin layout regardless of DB flags.

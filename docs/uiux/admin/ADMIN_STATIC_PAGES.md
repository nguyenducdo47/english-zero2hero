# Admin — Static pages & blog/news posts

## Overview

| Layer | URL | Admin |
|-------|-----|-------|
| Hub / generic page | `/{slug}` (`about`, `blog`, `news`) | `/admin/content/static-pages` |
| Blog article | `/blog/{slug}` | `/admin/content/posts` (channel Blog) |
| News article | `/news/{slug}` | `/admin/content/posts` (channel News) |

Hub `blog` / `news` show intro HTML + **card grid** of published posts. Generic hubs (`about`) remain single-page HTML.

## Data model

### `static_pages`

| Field | Purpose |
|-------|---------|
| `slug` | Global unique hub segment |
| `page_kind` | `generic` \| `blog` \| `news` |
| `is_published`, `show_in_header`, `show_in_footer` (default **on**), `sort_order` | Nav links when published |
| Translations | `title`, `excerpt`, `body` |

### `content_posts`

| Field | Purpose |
|-------|---------|
| `channel` | `blog` \| `news` |
| `slug` | **Unique with `channel`** (`unique(channel, slug)`) |
| `is_published`, `published_at`, `sort_order` | Listing sort on hub |
| Translations | `title`, `excerpt`, `body` |

Hub slug must match channel (`static_pages.slug = blog` and `page_kind = blog`).

## API

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/pages`, `/api/v1/pages/{slug}` | Public |
| GET | `/api/v1/pages/{hubSlug}/posts` | Public (hub must be blog/news) |
| GET | `/api/v1/blog/{slug}`, `/api/v1/news/{slug}` | Public |
| CRUD | `/api/v1/admin/static-pages` | Admin |
| CRUD | `/api/v1/admin/content-posts?channel=` | Admin |

## SEO

- Hubs: `page.{slug}`
- Posts: `blog.{slug}`, `news.{slug}` in [`seo_routes.php`](../../../apps/api/config/seo_routes.php) with `scope.channel`

## Web routes

- Hub: [`[slug]/page.tsx`](../../../apps/web/src/app/[locale]/(portal)/[slug]/page.tsx)
- Post: [`blog/[slug]/page.tsx`](../../../apps/web/src/app/[locale]/(portal)/blog/[slug]/page.tsx), [`news/[slug]/page.tsx`](../../../apps/web/src/app/[locale]/(portal)/news/[slug]/page.tsx)

## Seed

- `StaticPageSeeder` — hubs `about`, `blog`, `news`
- `ContentPostSeeder` — sample blog/news articles

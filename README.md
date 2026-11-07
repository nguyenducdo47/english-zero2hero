# English Zero2Hero

Website ôn tiếng Anh từ cơ bản đến nâng cao: **12 thì** (không đăng nhập), **TOEIC/IELTS** (Google login), chấm bài + AI, **API v1** cho app mobile.

## Monorepo

| Path | Stack |
|------|--------|
| [`apps/web`](apps/web) | Next.js 16 (SSG grammar, dashboard ôn thi) |
| [`apps/api`](apps/api) | Laravel 13 (REST API, OAuth, queue crawl) |
| [`packages/content`](packages/content) | Nguồn grammar + quiz JSON dùng chung |
| [`docs`](docs) | BA, DB, Laragon, content spec |

## Quick start (Laragon)

1. **API**

   ```bash
   cd apps/api
   cp .env.example .env   # chỉnh DB nếu dùng MySQL (xem docs/DATABASE.md)
   php artisan migrate --seed
   php artisan serve
   ```

   OpenAPI UI: http://localhost:8000/api/documentation

2. **Web**

   ```bash
   cd apps/web
   cp .env.local.example .env.local
   npm run dev
   ```

   Site: http://localhost:3000

Chi tiết: [`docs/LARAGON.md`](docs/LARAGON.md)

**Đa ngôn ngữ (vi/en):** [`docs/I18N.md`](docs/I18N.md) — web `next-intl`, API `X-Locale` / `Accept-Language`.

## GitHub

Repo khuyến nghị: **`english-zero2hero`**

## License

Educational project — nội dung đề thi public do bạn biên soạn; crawl chỉ whitelist + duyệt draft.

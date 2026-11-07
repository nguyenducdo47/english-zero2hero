# Laragon setup — English Zero2Hero

## Virtual host (tùy chọn)

- API: `english-zero2hero.test` → `apps/api/public`
- Web: `e2h.test` → proxy port 3000 hoặc build static

Hoặc chạy `php artisan serve` + `npm run dev` như README.

## MySQL

Tạo database `english_zero2hero`, trong `apps/api/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=english_zero2hero
DB_USERNAME=root
DB_PASSWORD=
```

Mặc định dev có thể dùng SQLite (đã migrate sẵn trong repo).

## Google OAuth

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:3000
```

## AI (tuỳ chọn)

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Không có key → chấm writing/speaking dùng rubric stub.

## Crawl whitelist

```env
E2H_CRAWL_WHITELIST=example.com,openstax.org
```

## Queue (crawl jobs)

```bash
cd apps/api
php artisan queue:work
```

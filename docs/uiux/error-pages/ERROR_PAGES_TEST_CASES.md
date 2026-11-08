# Error Pages — Test Cases

## Functional

1. Invalid grammar slug → 404 UI, learning shortcuts visible.
2. `/forbidden` → 403 UI, Dashboard primary.
3. `/500` → 500 UI.
4. `/maintenance` → 503 UI, Try Again reloads.
5. Throw in portal page → error boundary, Try Again calls `reset()`.
6. `/admin` without token → 401 UI, Sign In.
7. Logged-in non-admin → 403 UI (matches forbidden concept).

## HTTP (curl)

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/khong-co-trang
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/forbidden
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/500
curl -s -o /dev/null -w "%{http_code}" -D - http://localhost:3000/maintenance | grep -i retry-after
```

Expected: 404, 403, 500, 503 respectively (when dev server running).

## Responsive

- 375 / 768 / 1280 / 1440 — no horizontal scroll; CTAs wrap.

## SEO

- `robots: noindex` on error metadata.
- No error routes in `sitemap.ts`.

## Regression

- Portal home, grammar, admin shell unchanged.
- Auth gate still blocks admin content.

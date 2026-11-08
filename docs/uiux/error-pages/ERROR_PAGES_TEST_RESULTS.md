# Error Pages — Test Results

**Status:** To be run after `npm run dev` in `apps/web`.

| Check | Expected | Result |
|-------|----------|--------|
| Unknown URL | 404 + redesigned UI | _pending_ |
| `/forbidden` | HTTP 403 | _pending_ |
| `/500` | HTTP 500 | _pending_ |
| `/maintenance` | HTTP 503 + Retry-After | _pending_ |
| Runtime `error.tsx` | UI 500, no digest to user | _pending_ |
| Admin forbidden | 403 full-screen | _pending_ |
| Console on prod error | No stack in UI | OK (digest removed from `global-error`) |

## Known limitations

- Next.js **error boundary** responses may still report **HTTP 200** for the HTML document while showing the 500 UI — behaviour depends on Next 16 / RSC. Dedicated `/500` route uses middleware status **500**.
- Admin 403 is client-gated; HTTP status remains **200** until server-side admin auth is added (unchanged by design).

## Manual UI sign-off

- [ ] EN + VI copy on all four concepts
- [ ] Illustrations consistent
- [ ] Dark mode readable
- [ ] Keyboard focus on CTAs

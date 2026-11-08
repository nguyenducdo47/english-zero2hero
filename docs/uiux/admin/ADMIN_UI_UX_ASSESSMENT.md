# Admin UI/UX — Assessment (Phase 1)

**Date:** 2026-03-23  
**Scope:** English Zero2Hero — `apps/web` + `apps/api`  
**Status:** Assessment complete — **Admin route group + shell shipped** (see §7 for i18n / dark mode)

---

## 1. Executive summary

The product has a **functional but minimal** admin experience at `/[locale]/admin`: three tabs (Integrations, Locales, Translations) rendered **inside the User Portal shell** (`SiteHeader`, `SiteFooter`, shared `[locale]/layout.tsx`). Backend admin APIs exist for i18n, content translations, and encrypted integration settings (mail, Google).

The master prompt requires a **fully independent Admin Portal** (sidebar, admin header, design tokens). Current implementation **does not meet** that separation. This assessment maps gaps and real vs. aspirational modules before layout work.

---

## 2. Technology stack (verified)

| Item | Version / choice |
|------|------------------|
| Next.js | 16.4.5 (App Router, `cacheComponents`, `partialPrefetching`) |
| React | 19.3.0 |
| TypeScript | ^5 |
| Tailwind | ^4 (`@tailwindcss/turbopack`) |
| next-intl | ^4.14.9 (`[locale]` segment, `vi` + `en`) |
| UI | shadcn 4.x on **Base UI** (`@base-ui/react`) |
| Icons | lucide-react |
| Charts | recharts (used on user `/analytics` only) |
| Motion | not installed |
| Rich text editor | none |

**User portal design reference:** `docs/uiux/DESIGN_SYSTEM.md` (learning-focused tokens, gamification patterns).

---

## 3. App Router architecture

```
apps/web/src/app/
  layout.tsx                    # root passthrough
  [locale]/layout.tsx           # USER SHELL: html/body, fonts, SiteHeader, main, SiteFooter
  [locale]/admin/               # ADMIN PAGES — still wrapped by USER layout
  [locale]/dashboard|grammar|exams|profile|...
```

**Issue:** Admin and user routes share one layout. `AdminNavLink` appears in `SiteHeader` — explicit coupling.

**Recommended target (Phase 3):**

```
[locale]/(portal)/layout.tsx    # UserLayout
[locale]/(admin)/layout.tsx     # AdminLayout (no SiteHeader/SiteFooter)
```

Admin URLs can remain `/admin/...` under `(admin)` group; locale prefix preserved for next-intl.

---

## 4. Existing admin features (frontend)

| Feature | Route / UI | Maturity |
|---------|------------|----------|
| Integration settings (mail, Google) | `/admin` tab | Forms, PATCH groups `mail` \| `google` |
| Locale CRUD (list, toggle, default, add) | `/admin` tab | Table-like UI, no data-table component |
| Grammar/quiz translations | `/admin` tab | Catalog + per-locale fields |
| Auth gate | Client: `is_admin` from `/auth/me` | No server-side route guard in Next |
| Navigation | Header link “Quản trị” | Violates admin independence |

**Not implemented (UI):** dashboard metrics, user management, course/lesson CMS, question bank admin, TOEIC/IELTS builders, roles/permissions UI, SEO admin, editor, webhooks, audit logs, media library.

---

## 5. Existing admin API (backend)

All under `auth:sanctum` + middleware `admin` (`users.is_admin`).

| Endpoint group | Purpose |
|----------------|---------|
| `GET/POST/PATCH admin/locales` | Locale registry |
| `GET/PUT admin/translations` | tense_group, tense, question (by slug/id) |
| `GET admin/catalog/*` | Pickers for translation UI |
| `GET/PATCH admin/settings/{mail\|google}` | DB settings, secrets encrypted |

**Authorization:** Single boolean `is_admin` — no roles/permissions matrix, no audit log table.

**User-facing data (not admin CRUD):** grammar read APIs, exams, attempts, mock registrations, content-sources, user progress, AI grading (services exist; no admin UI).

---

## 6. Authentication & security

- **Web:** Bearer token in `localStorage` (`e2h_token`); `useAuthToken` + `fetchAuthMe`.
- **Admin API:** 403 `forbidden_admin` for non-admins.
- **Secrets:** `site_settings` + `SettingsService` (Laravel `Crypt`); admin GET masks secrets.
- **Gap:** Next.js does not block `/admin` SSR for non-admins; flash of user chrome + client redirect/403 message.

---

## 7. User portal vs admin (separation audit)

| Rule | Current state |
|------|----------------|
| Separate layout | ✅ `(portal)` vs `(admin)` under `[locale]`; admin không dùng `SiteHeader`/`SiteFooter` |
| Separate header | ✅ `AdminHeader` + breadcrumb; link “Về cổng học viên” |
| Separate sidebar | ✅ `AdminSidebar` + `lib/admin-nav.ts` |
| UI locale (vi/en) | ✅ Namespace `admin` trong `messages/*`; `LocaleSwitcher` trên admin header (`router.replace` giữ path `/admin/...`) |
| Dark mode | ✅ Chung `ThemeInit` + `theme-storage` với portal; token `--admin-*` trong `admin-theme.css`; `ThemeToggle` trên admin header |
| No gamification in admin | ✅ Admin pages have no XP/streak UI |
| Separate design tokens | ✅ `admin-theme.css` scoped `.admin-root` (+ `.dark .admin-root`) |
| Shared low-level utils | ✅ `lib/api` (gửi `Accept-Language` / `X-Locale`), toast, shadcn primitives (OK) |

---

## 8. Suggested navigation vs reality

| Nav item (prompt) | Backend / product | Recommendation |
|-------------------|-------------------|----------------|
| Dashboard | No admin stats API | Phase 4 — define metrics API first |
| Courses / Paths / Lessons | No course entity; grammar in DB + `packages/content` | **Future** — grammar/tense admin first |
| Grammar | Public API + translations admin | Link to **Translations** (existing) |
| Vocabulary | Not in product | Document only |
| TOEIC / IELTS | `exams`, `questions` seeded; read APIs | **Phase 4** — exam publish UI; no full CMS |
| Question bank | Questions in DB; partial translation admin | Extend translations + exam filter |
| Users | No admin user list API | **Requires API** |
| Roles & permissions | Only `is_admin` | **Future** |
| Analytics | User `/analytics` (client stats) | Admin reports need new aggregation |
| System settings | `site_settings` partial | **Integrations** tab → move under System |
| SEO | `staticSiteMetadata`, `sitemap.ts` static | **Requires** metadata store + admin API |
| Editor / Media / Webhooks / Payment | Not present | Not applicable until product decision |

---

## 9. SEO & configuration (current)

- **Global metadata:** `staticSiteMetadata` in `lib/site-metadata.ts`; locale layout sets `metadata`.
- **Sitemap:** `app/sitemap.ts` — static routes.
- **robots:** default Next behavior; no admin-managed robots.txt.
- **Admin routes:** should stay `noindex` when admin layout ships.

No backend for page-level SEO or OG management.

---

## 10. UI component inventory (admin-relevant)

**Present:** Button, Card, Input, Label, Tabs, Alert, Badge, Progress, Separator, Skeleton, Sonner.

**Missing for enterprise admin (typical shadcn add):** Table, Sheet (mobile drawer), Dropdown Menu, Dialog, Breadcrumb, Switch, Select, Checkbox, Tooltip, Scroll Area.

**No** shared `DataTable` abstraction.

---

## 11. Risks & constraints

1. **next-intl + `[locale]`:** Admin layout must still call `setRequestLocale` / messages; consider admin default locale `vi` for ops.
2. **`instant = false` on `/admin` page** — blocking route for locale metadata; admin layout should isolate runtime reads.
3. **Do not invent APIs** — user/audit/SEO modules need Laravel work first.
4. **Dual experience:** Link “Về cổng học viên” from admin header to user dashboard (not user header in admin).

---

## 12. Phase 1 conclusion

**Ready for Phase 3 (layout):** Yes, with clear scope — shell + navigation + migrate existing three panels.

**Not ready for full CMS/SEO/payments:** Document as backend-dependent; UI stubs only after API contracts.

**Next artifact:** `ADMIN_DESIGN_SYSTEM.md`, `ADMIN_IMPLEMENTATION_PLAN.md`, `ADMIN_COMPONENT_ARCHITECTURE.md`.

# Admin Implementation Plan

**Prerequisite:** Phase 1 assessment (`ADMIN_UI_UX_ASSESSMENT.md`) and this document approved before large refactors.

---

## Phase 3 — Layout & separation (priority)

### 3.1 Routing

1. Introduce route groups under `[locale]`:
   - `(portal)/layout.tsx` — move current user chrome from `[locale]/layout.tsx` (header, footer, max-w-6xl main).
   - `(admin)/layout.tsx` — `AdminLayout` only; **no** `SiteHeader`.
2. Move user pages into `(portal)/` (incremental: layout split first, then move folders).
3. Move `admin/**` into `(admin)/admin/**`; keep URL `/admin`.
4. Remove `AdminNavLink` from `SiteHeader`; add “Admin” entry only in admin profile menu + optional footer link on profile for admins.
5. Admin header: link “Cổng học viên” → `/dashboard`.

### 3.2 Components (new)

| File | Notes |
|------|--------|
| `components/admin/admin-layout.tsx` | Shell |
| `components/admin/admin-sidebar.tsx` | Config-driven nav |
| `components/admin/admin-header.tsx` | Breadcrumb + user menu |
| `components/admin/admin-breadcrumb.tsx` | From pathname |
| `components/admin/admin-page-header.tsx` | Title / actions |
| `components/admin/admin-mobile-nav.tsx` | Sheet drawer |
| `lib/admin-nav.ts` | Nav items + feature flags |

### 3.3 shadcn additions

Install (Base UI): `sheet`, `dropdown-menu`, `breadcrumb`, `tooltip`, `scroll-area`, `table`, `switch`, `select`, `dialog`, `separator` (if missing).

### 3.4 Migrate existing admin UI

- Split `admin-page-client.tsx` into routed subpages:
  - `/admin` → Dashboard placeholder (metrics TBD)
  - `/admin/system/integrations` — current Integrations panel
  - `/admin/content/locales` — Locales panel
  - `/admin/content/translations` — Translations panel
- Wrap each in `AdminPageHeader`.

### 3.5 Auth UX

- Client guard remains until middleware optional.
- Consider `middleware.ts` cookie-less check: redirect to login if no token (optional).
- Metadata: `robots: { index: false }` on all `(admin)` routes.

**Exit criteria:** Admin pages render without user header; sidebar navigates; mobile drawer works; existing three modules still save data.

---

## Phase 4 — Modules tied to **existing** API

| Page | API | Notes |
|------|-----|-------|
| Integrations | `admin/settings/*` | Already built |
| Locales | `admin/locales` | Already built |
| Translations | `admin/translations`, `catalog` | Already built |
| Dashboard | **New** | `GET admin/metrics` — users count, exams count, locales; minimal MVP |
| Content catalog | Catalog endpoints | Read-only overview tables |

---

## Phase 5 — Backend-dependent (do not fake UI)

Document API contract in `docs/uiux/admin/*_CONFIGURATION.md` before UI.

| Module | Backend work |
|--------|----------------|
| User management | `GET/PATCH admin/users`, pagination |
| Roles | `roles`, `permissions` tables + policies |
| SEO admin | `seo_settings` + Next metadata bridge |
| Editor config | Tiptap choice + upload API |
| Audit logs | `audit_logs` without secret values |
| Email templates | DB + send test endpoint |
| Webhooks / Payment / Storage | product decision |

---

## Phase 6 — Advanced configuration (section 16)

See individual design docs under `docs/uiux/admin/`. Status summary:

| Doc | Status |
|-----|--------|
| `ADMIN_SEO_CONFIGURATION.md` | Future — static metadata today |
| `ADMIN_EDITOR_CONFIGURATION.md` | Future — no editor |
| `ADMIN_API_INTEGRATION_CONFIGURATION.md` | **Partial** — mail/google live |
| `ADMIN_WEBHOOK_MANAGEMENT.md` | N/A |
| `ADMIN_EMAIL_CONFIGURATION.md` | Partial — SMTP group only |
| `ADMIN_STORAGE_CONFIGURATION.md` | N/A |
| `ADMIN_PAYMENT_CONFIGURATION.md` | N/A |
| `ADMIN_SYSTEM_SETTINGS.md` | Partial — site_settings registry |
| `ADMIN_AUDIT_LOG_DESIGN.md` | Future |
| `ADMIN_CONFIGURATION_SECURITY.md` | **Now** — document Crypt/masking |

---

## Phase 7 — Testing & reports

- `ADMIN_TESTING_REPORT.md` after Phase 3–4 manual QA + `npm run lint` + `next build`.
- `ADMIN_IMPLEMENTATION_REPORT.md` updated per milestone.
- Verify sibling portal routes after layout split (grammar, exams, admin).

---

## Admin nav priority (approved — Phase 3)

| Order | Item | Route | API |
|-------|------|-------|-----|
| 1 | Dashboard | `/admin` | `GET admin/metrics` (MVP) |
| 2 | Locales | `/admin/content/locales` | existing |
| 3 | Translations | `/admin/content/translations` | existing |
| 4 | Integrations | `/admin/system/integrations` | existing |

Deferred (no nav link): Courses, Users, SEO, Editor, Exams CMS, Payment, Webhooks.

Implementation: `lib/admin-nav.ts` + sidebar groups Overview / Content / System.

---

## Effort order (recommended)

1. Route groups + AdminLayout + theme scope  
2. Sidebar + header + breadcrumbs  
3. Sub-routes + migrate 3 panels  
4. Dashboard MVP (after metrics API)  
5. shadcn Table + patterns for future CRUD  
6. Configuration/SEO docs + backend spikes  

---

## Dependencies

No new npm packages in Phase 3 except shadcn CLI additions. **Do not** add Ant Design or second editor in Phase 3.

Recharts: lazy-load on dashboard only when metrics exist.

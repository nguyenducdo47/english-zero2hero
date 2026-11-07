# Admin Component Architecture

## Layering

```
app/[locale]/(admin)/layout.tsx
  └─ AdminLayout (server or client shell)
       ├─ AdminSidebar
       ├─ div.flex.flex-col.flex-1
       │    ├─ AdminHeader
       │    └─ AdminMain
       │         └─ {children}  ← route pages
       └─ AdminMobileNav (portal sheet)
```

**User portal (target):**

```
app/[locale]/(portal)/layout.tsx
  └─ UserLayout
       ├─ SiteHeader
       ├─ main.max-w-6xl
       └─ SiteFooter
```

No shared layout between `(admin)` and `(portal)`.

---

## Directory convention

| Path | Contents |
|------|----------|
| `components/admin/layout/*` | Layout chrome |
| `components/admin/navigation/*` | Nav config renderers |
| `components/admin/data/*` | DataTable, filters (future) |
| `components/admin/forms/*` | Integration forms, etc. |
| `app/[locale]/(admin)/admin/**/page.tsx` | Thin server pages |
| `app/[locale]/(admin)/admin/**/*-client.tsx` | Client panels |

**Shared (allowed):** `lib/api`, `lib/api-error`, `lib/toast`, `components/ui/*` — primitive only, no `site-header`.

---

## State & data

- Auth: `useAuthToken` + `fetchAuthMe` at layout level; pass `token` to panels or context `AdminSessionProvider`.
- Avoid prop drilling: single `AdminSessionContext` with `{ token, user, locale }`.

---

## Navigation config

```ts
// lib/admin-nav.ts
export type AdminNavItem = {
  id: string;
  labelKey: string; // messages admin.nav.*
  href: string;
  icon: LucideIcon;
  badge?: "soon";
  children?: AdminNavItem[];
};
```

Sidebar maps `pathname` → active id; groups collapsible with localStorage persistence.

---

## Breadcrumbs

Derive from `admin-nav` + dynamic segments (e.g. `translations`). Max depth 3.

---

## Page template

```tsx
// Typical admin page
<AdminPageHeader title={...} description={...} actions={<Button>...</Button>} />
<section className="space-y-6">
  <PanelClient />
</section>
```

---

## Existing files to refactor (Phase 3)

| Current | Target |
|---------|--------|
| `admin-page-client.tsx` | Remove; replace with layout + subroutes |
| `admin-*-panel.tsx` | Move to `admin/system/` or `admin/content/` routes |
| `admin-nav-link.tsx` | Delete from user header; admin profile menu only |

---

## Instant navigation / Suspense

Admin layout server component should avoid blocking reads where possible; child client pages may use `export const instant = false` per route until locale streaming is bounded in Suspense.

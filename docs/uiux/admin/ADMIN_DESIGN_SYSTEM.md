# Admin Design System

**Status:** Specification for Admin Portal only — **do not merge with User Portal tokens in components.**

User portal reference: `docs/uiux/DESIGN_SYSTEM.md` (learning/gamification). Admin uses overlapping hex values but **separate CSS scope** (`data-admin` or `.admin-root`).

---

## 1. Design language

**Modern Enterprise SaaS Dashboard** — Linear/Vercel spacing and type rhythm; Ant Design–like density for tables and forms; no student gamification.

Principles: clarity, hierarchy, operational control, flat surfaces, thin borders, minimal motion.

---

## 2. Color tokens (admin)

Implement as `--admin-*` on `.admin-root` (light-first; dark optional later).

| Token | Hex | Usage |
|-------|-----|--------|
| `--admin-primary` | `#2563EB` | Primary actions, active nav accent |
| `--admin-primary-hover` | `#1D4ED8` | Hover |
| `--admin-sidebar-bg` | `#FFFFFF` | Sidebar surface |
| `--admin-sidebar-active` | `#EFF6FF` | Active nav item |
| `--admin-sidebar-text` | `#334155` | Nav labels |
| `--admin-bg` | `#F8FAFC` | Main canvas |
| `--admin-surface` | `#FFFFFF` | Cards, header |
| `--admin-text` | `#0F172A` | Headings, primary text |
| `--admin-text-muted` | `#64748B` | Secondary |
| `--admin-border` | `#E2E8F0` | Dividers |
| `--admin-success` | `#16A34A` | Success badges |
| `--admin-warning` | `#F59E0B` | Warnings |
| `--admin-danger` | `#DC2626` | Destructive |
| `--admin-info` | `#0EA5E9` | Info |

Map shadcn variables **inside admin layout only** so Button/Input in admin pick up admin theme without affecting portal.

---

## 3. Typography

Reuse font files from user layout (already loaded):

- **Headings:** Plus Jakarta Sans — page titles `text-xl/2xl font-semibold`, section `text-lg font-medium`.
- **Body / tables:** Inter — `text-sm` default for dense tables; `text-xs` for meta.

Line height: 1.5 body, 1.25 for table rows.

---

## 4. Spacing & radius

- Page padding: `p-4 md:p-6 lg:p-8`
- Sidebar width: `260px` (`w-[260px]`)
- Collapsed sidebar: `72px` icon rail
- Radius: `rounded-lg` (8px) inputs/buttons; `rounded-xl` (12px) cards
- Shadow: `shadow-sm` on header/sidebar edge only
- Content max-width: full width of main column (no `max-w-6xl` marketing cap)

---

## 5. Layout components

| Component | Responsibility |
|-----------|----------------|
| `AdminLayout` | `admin-root`, flex row, min-h-dvh |
| `AdminSidebar` | Nav groups, collapse, mobile sheet |
| `AdminHeader` | Breadcrumb, title slot, profile menu |
| `AdminMain` | Scrollable content region |
| `AdminPageHeader` | Title, description, actions slot |

---

## 6. Navigation visual states

- **Default:** `text-admin-sidebar-text`, hover `bg-slate-50`
- **Active:** `bg-[var(--admin-sidebar-active)]`, `text-[var(--admin-primary)]`, left border 2px primary
- **Group label:** `text-xs uppercase tracking-wide text-muted`
- **Collapsed:** icons only + `Tooltip` (shadcn)

---

## 7. Data display

- **Tables:** zebra optional off; row hover `bg-slate-50`; sticky header
- **Badges:** semantic colors above; pill `rounded-full px-2 py-0.5 text-xs`
- **Empty states:** icon + one line + primary action (no illustration)

---

## 8. Forms

- Label above field; required `*`
- Error text `text-destructive text-sm` under field
- Secret fields: password input + hint “leave blank to keep”
- Footer actions: Cancel (outline) + Save (primary), right-aligned

---

## 9. Accessibility

- Skip link to main content
- Drawer focus trap on mobile
- `aria-current="page"` on active nav
- Breadcrumb `nav` with `ol`

---

## 10. File placement (planned)

```
apps/web/src/
  components/admin/          # Admin-only UI
  styles/admin-theme.css     # Optional token file imported only in AdminLayout
```

**Prohibited:** importing `SiteHeader` / `SiteFooter` in admin tree.

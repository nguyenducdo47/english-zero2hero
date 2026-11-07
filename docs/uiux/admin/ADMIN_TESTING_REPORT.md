# Admin Testing Report

**Status:** Pending Phase 3 implementation — **no fabricated results.**

## Planned test matrix (after AdminLayout)

| Area | Cases |
|------|--------|
| Layout separation | Admin routes render without `SiteHeader`; portal routes unchanged |
| Sidebar | Active state, collapse, mobile drawer |
| Auth | Non-admin blocked; admin can save integrations/locales/translations |
| Responsive | 390px, 768px, 1280px |
| Regression | `/grammar`, `/exams`, `/login` lint + smoke |
| Build | `npm run lint`, `next build` |

## Current automated status

Not re-run for Phase 1–2 doc-only phase.

## Manual smoke (existing admin)

- `/vi/admin` returns 200; `instant = false` for blocking route insight.
- Integration PATCH requires admin token (verified during initial admin build).

Full report to be completed at end of Phase 3.

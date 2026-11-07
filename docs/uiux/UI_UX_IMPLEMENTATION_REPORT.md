# UI/UX Implementation Report

**Updated:** 2026-11-07  
**Phase:** 4 (in progress)

## Completed

### Design system (Phase 3)

- **shadcn/ui** (`base-nova`, Base UI) + `components.json`
- **Tailwind v4** tokens: primary blue, secondary teal, success/warning/accent brand
- **Fonts:** Inter, Plus Jakarta Sans, Noto Sans
- **UI primitives:** button, card, badge, progress, alert, skeleton, input, label, tabs, radio-group, separator
- **Layout:** `SiteHeader`, `SiteFooter`, `PageHeader`, `HeaderAuthLink`
- **Learning:** stats bar, continue learning, dashboard progress, tense detail editorial, quiz focus components, roadmap levels

### Phase 4 pages

| ID | Page | Route | Status |
|----|------|-------|--------|
| P1–P3 | Home, dashboard, grammar hub | `/`, `/dashboard`, `/grammar` | Done |
| P4 | Tense detail | `/grammar/[slug]` | Editorial layout + pitfalls alert |
| P5 | Quiz focus + results | `/grammar/.../quiz` | `quiz-runner`, `quiz-results` |
| P6 | Exams catalog | `/exams` | Tabs + cards |
| P6b | Exam detail | `/exams/[slug]` | Progress, RadioGroup, results alert |
| P7 | Mock exams | `/mock-exams` | Form + cards |
| P8 | Roadmap | `/roadmap` | 7 levels + local progress badges |
| P9 | Analytics | `/analytics` | Recharts (lazy), local grammar chart |
| P10 | Profile | `/profile` | `auth/me`, sync `user/progress/e2h_learning` |
| — | Login | `/login` | shadcn Card, benefits column, dev login |
| — | Auth callback | `/auth/callback` | Card + Alert |
| — | Mock timer | `/mock-exams/session/[slug]` | `ExamCountdown`, auto-submit, `lib/mock-session.ts` |

### Gamification sync (V2 partial)

- `lib/progress-sync.ts` — pull/push learning stats when Bearer token present
- Profile “Đồng bộ lên server” triggers `PUT /api/v1/user/progress/e2h_learning`

### Dependencies

- `recharts` (analytics, dynamic import)
- Existing: `@base-ui/react`, `lucide-react`, `next-intl`, etc.

### Build

`npm run build` — verify after each Phase 4 batch

## Not yet done

- Timed mock: section-level timers / full proctoring (single session countdown only)
- Server-side exam analytics / Recharts from API
- Vocabulary flashcards
- Admin locales/translations UI
- Phase 5 manual QA checklist (see UI_UX_TESTING_REPORT.md)

See [UI_UX_IMPLEMENTATION_PLAN.md](./UI_UX_IMPLEMENTATION_PLAN.md).

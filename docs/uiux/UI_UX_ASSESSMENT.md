# UI/UX Assessment — English Zero2Hero (Phase 1)

**Date:** 2026-11-07  
**Scope:** `apps/web` (Next.js), cross-reference `apps/api` + `packages/content`  
**Status:** Assessment only — no design-system or page overhaul implemented in this phase.

---

## 1. Executive summary

English Zero2Hero is a **functional MVP**: grammar (12 tenses) from static JSON, group quizzes via API, exam catalog + attempts behind Sanctum, mock registration, vi/en UI strings, dark mode, and local grammar progress in `localStorage`.

The UI is **not yet** a cohesive EdTech product. It reads as a **developer prototype**: single top nav, utility Tailwind classes, no component library, minimal landing page, no dashboard/roadmap/vocabulary/analytics/profile, and **no real gamification** (streak/XP/badges) beyond a one-line local progress counter.

**Recommendation:** Extend the current App Router + `next-intl` architecture; introduce **shadcn/ui (Base UI)** + design tokens aligned with the master prompt; refactor incrementally **without** breaking API contracts or grammar SSG flow.

---

## 2. Frontend architecture

| Item | Current state |
|------|----------------|
| Framework | **Next.js 16.4.5** (App Router, `cacheComponents`, `partialPrefetching`, Turbopack) |
| React | **19.3.0** |
| TypeScript | **^5** |
| Styling | **Tailwind CSS v4** (`@import "tailwindcss"`, `@theme inline`, `@custom-variant dark`) |
| i18n | **next-intl 4.14** — routes under `src/app/[locale]/…`, `messages/vi.json` + `en.json` |
| Root layout | Passthrough `children` only (`src/app/layout.tsx`) |
| Locale layout | Owns `<html>`/`<body>`, fonts **Geist Sans/Mono** (not Inter/Plus Jakarta) |
| Data — grammar | **SSG/SSG-friendly:** `packages/content` + `lib/grammar-data.ts` |
| Data — exams/quiz | **Client fetch** → Laravel `NEXT_PUBLIC_API_URL` + Bearer token |
| Auth (web) | Google OAuth redirect; **dev-login** GET (local); token in `localStorage` (`e2h_token`) |

**Routing inventory (implemented):**

| Route | Purpose |
|-------|---------|
| `/[locale]` | Minimal home (hero gradient + 2 phase cards + local progress text) |
| `/[locale]/grammar` | 12 tenses grid by group |
| `/[locale]/grammar/[slug]` | Tense detail (structure, usage, signals, pitfalls, examples, TTS) |
| `/[locale]/grammar/groups/[slug]/quiz` | Group quiz (`QuizRunner`) |
| `/[locale]/login` | Google + dev login |
| `/[locale]/auth/callback` | Token handoff |
| `/[locale]/exams` | Exam list (auth) |
| `/[locale]/exams/[slug]` | Exam attempt UI (client) |
| `/[locale]/mock-exams` | Mock registration form |

**Not implemented (master prompt expects later):** landing sections (FAQ, testimonials, paths), learning dashboard, roadmap levels, vocabulary, lesson detail system, dedicated quiz results UX, TOEIC/IELTS skill hubs, mock test timer UX, analytics (Recharts), profile/settings.

---

## 3. Dependencies vs master stack

| Required (prompt) | Present |
|-------------------|---------|
| Next.js | Yes |
| TypeScript | Yes |
| Tailwind CSS | Yes v4 |
| shadcn/ui | **No** (`components.json` absent) |
| Lucide React | **No** (inline SVG in theme toggle only) |
| Motion | **No** |
| Recharts | **No** |

**Implication:** Phase 3 must run official shadcn Next.js install, verify **React 19 / Next 16** compatibility, choose **Base UI** path per shadcn docs, add only components needed per feature.

---

## 4. Design system (as-is)

### Colors

CSS variables in `globals.css`: `--background`, `--foreground`, `--surface`, `--surface-muted`, `--border`.  
Accent usage in UI is mostly **indigo/violet** (hero gradient), not the prompt palette (#2563EB primary, #14B8A6 secondary, etc.) as formal tokens.

### Typography

Geist via `next/font` — good performance, but **not** Plus Jakarta / Inter / Noto IPA stack from prompt.

### Components

| Component | Role |
|-----------|------|
| `SiteHeader` | Top nav links + locale + theme |
| `LocaleSwitcher` | Native `<select>` |
| `ThemeToggle` / `ThemeInit` | Dark mode |
| `ProgressSummary` | Client read of localStorage progress |
| `QuizRunner` | MCQ/fill quiz, submit to API |
| `TtsButton` | Browser TTS |
| `TenseReadTracker` | Mark tense read (local) |

No shared `Button`, `Card`, `Dialog`, `Tabs`, sidebar, footer, empty/loading primitives.

### Spacing & radius

Ad hoc: `rounded-xl`, `rounded-2xl`, `max-w-5xl` container — **no documented spacing scale**.

---

## 5. UX problems (observed)

### Beginner / learning

- Home does **not** explain learning path for “mất gốc”; CTAs exist but no structured onboarding.
- Grammar detail is **readable** but not **editorial**: no visual formula highlights, no Affirm/Neg/Question blocks, limited scan hierarchy.
- Quiz: all questions on one page; **no per-question focus**, progress bar, or results screen with weak-area hints (API may return explanations; UI is basic).
- Mixed content sources: grammar **JSON** vs quiz **API** — error messages assume Laravel running (good for dev, harsh for learners).

### Motivation / gamification

- Only `e2h_grammar_progress` in localStorage (tenses + groups completed).
- **No** streak, XP, levels, badges, daily goals.
- API has `user/progress/{key}` when logged in — **not wired** in web UI.

### Navigation & IA

- Flat header; **no** dashboard entry, **no** footer, **no** mobile menu pattern.
- Exam vs mock vs grammar not grouped under “Learning paths.”
- Login always visible even on grammar-only journey.

### Exams

- List/detail work with token; UX is list of links + client exam shell — **not** exam-prep dashboard or skill breakdown (TOEIC parts / IELTS bands).

### Accessibility

- Partial: `sr-only` on locale label, semantic headings.
- Gaps: focus styles inconsistent, native selects, no skip link, contrast on some `text-slate-500` / dark pairs not audited.

### Responsive

- Grids use `sm:` breakpoints; header nav **wraps** on small screens — acceptable but not mobile-first app shell.

### Technical UX (Next 16)

- Several routes use `export const instant = false` + server/client split — correct for stability.
- Theme init is client `useLayoutEffect` (acceptable tradeoff vs inline script).
- Metadata: static site metadata in layout; per-page titles on grammar.

---

## 6. Performance notes

**Strengths**

- Grammar pages lean on static data — good for LCP on content.
- Limited dependencies — small client bundles.
- `cacheComponents` enabled.

**Risks**

- Adding shadcn + Recharts + Motion without lazy boundaries could inflate JS.
- Exam flows are client-heavy (`useEffect` fetch).
- No `next/image` usage audit (few images today).

---

## 7. Backend / API constraints (UI must respect)

- Grammar public endpoints: `/api/v1/grammar/*`, quiz POST attempts **without** auth for tense groups.
- Exams, attempts, mock, progress: **Sanctum Bearer**; no cookie SPA session.
- Locales: API `X-Locale` + `translations` model (dynamic locales planned).
- Do **not** mock exam scores or AI grading in UI as if production-ready unless API returns real data.

---

## 8. Gap analysis vs master prompt pages

| Page (prompt) | Gap |
|---------------|-----|
| Landing (full) | ~10% — hero + 2 cards only |
| Learning dashboard | Missing |
| Roadmap (7 levels) | Missing |
| Grammar | ~60% — content OK, presentation weak |
| Vocabulary | Missing |
| Lesson detail | Partial (tense = lesson unit) |
| Exercise / quiz | ~40% — functional, not focus-mode |
| Exercise results | ~30% — inline after submit |
| TOEIC hub | Missing (only mini exam slug) |
| IELTS hub | Missing |
| Mock test UX | Form only, no timed test UI |
| Analytics | Missing |
| Profile / settings | Missing |

---

## 9. Technical constraints & risks

1. **Tailwind v4 + shadcn** — verify generator compatibility before mass install.
2. **next-intl** — all new pages must live under `[locale]`; strings in JSON, not hardcoded.
3. **Don't replace grammar JSON pipeline** until API/content parity is decided.
4. **Gamification** needs product decision: local-only vs sync via `user/progress` API.
5. **Fonts switch** (Inter/Jakarta/Noto) affects layout and Vietnamese diacritics testing.

---

## 10. Phase 1 conclusion

The codebase is a **solid foundation for content and API integration**, not for commercial EdTech UI. Safe path: **design system first**, then **homepage + dashboard + grammar/quiz polish**, then exam hubs as API features mature.

**Next step:** [UI_UX_IMPLEMENTATION_PLAN.md](./UI_UX_IMPLEMENTATION_PLAN.md) (Phase 2 proposal).  
Supporting proposals: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md).

Implementation and testing reports remain placeholders until Phase 3+.

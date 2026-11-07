# UI/UX Implementation Plan (Phase 2 proposal)

**Prerequisite:** [UI_UX_ASSESSMENT.md](./UI_UX_ASSESSMENT.md)  
**Rule:** No breaking changes to API contracts, auth flow, or grammar static generation without explicit approval.

---

## 1. Design language (target)

**Friendly Academic — Modern Gamified EdTech** (per master prompt):

- Motivation: streak, XP, goals, badges — **light touch**, no childish art.
- Structure: SaaS-style dashboard cards, clear hierarchy.
- Content: editorial grammar blocks, bilingual examples, mistake callouts.

Differentiator vs Duolingo: **Vietnamese-first explanations**, TOEIC/IELTS thread, **12-tense spine** visible on every dashboard.

---

## 2. Phased delivery

### Phase 3 — Design system (1–2 weeks)

1. Install shadcn/ui on `apps/web` per [official Next guide](https://ui.shadcn.com/docs/installation/next) with **Base UI**.
2. Map tokens in `globals.css` to prompt palette (primary `#2563EB`, secondary/success `#14B8A6`, warning, accent, semantic text/border).
3. Fonts: **Plus Jakarta Sans** (headings), **Inter** (body), **Noto Sans** (IPA) via `next/font`.
4. Add minimal shadcn set: `button`, `card`, `badge`, `progress`, `tabs`, `dialog`, `input`, `label`, `select`, `separator`, `skeleton`, `alert`.
5. App shell: `SiteHeader` → refactor to use `Button`/`NavigationMenu`; add **Footer** component.
6. Shared: `PageHeader`, `StatCard`, `EmptyState`, `ErrorState`, `LoadingSkeleton`.

**Exit criteria:** Storybook optional; at least one reference page (style guide route `/[locale]/design-system` internal or docs-only).

### Phase 4 — Page priority (aligned with real routes)

| Order | Deliverable | Route strategy |
|-------|-------------|----------------|
| P1 | **Home / landing** (sections 1–8 subset: hero, benefits, paths, grammar CTA, TOEIC/IELTS teasers, FAQ stub) | Extend `/[locale]/page.tsx` |
| P2 | **Learning dashboard** | New `/[locale]/dashboard` — Continue learning, streak/XP **UI** backed by localStorage first, optional API sync |
| P3 | **Grammar hub** | Redesign `/grammar` — group roadmap, progress rings, “next tense” |
| P4 | **Tense detail** | Editorial layout: structure pills, Aff/Neg/Q tables, examples, pitfalls alert |
| P5 | **Quiz focus mode** | Progress bar, one-question-at-a-time option, results screen |
| P6 | **Exams** | TOEIC/IELTS tabs on `/exams`, card design, empty/login states |
| P7 | **Mock exams** | Clearer form + link to future timed mock |
| P8 | **Roadmap** | `/[locale]/roadmap` — 7 levels **content model TBD** (mostly unlocked; no fake locks) |
| P9 | **Analytics** | `/[locale]/analytics` — Recharts lazy; wire when API metrics exist |
| P10 | **Profile** | `/[locale]/profile` — goals, `auth/me`, progress keys |

**Defer until product/API ready:** vocabulary flashcards, full mock timer, testimonials with real data, admin UI.

### Phase 5 — Testing

- Visual: desktop / tablet / mobile breakpoints (375, 768, 1280).
- a11y: keyboard nav on quiz + dialogs; axe spot checks.
- `npm run lint`, `npm run build` in CI.
- Manual: dev-login → exams; grammar offline; locale switch; dark mode.

### Phase 6 — Review

Update [UI_UX_IMPLEMENTATION_REPORT.md](./UI_UX_IMPLEMENTATION_REPORT.md) and [UI_UX_TESTING_REPORT.md](./UI_UX_TESTING_REPORT.md) with real results.

---

## 3. Navigation structure (proposed)

```
Header
├── Learn (Grammar, Roadmap)
├── Practice (Quizzes)
├── Exams (TOEIC, IELTS, Mock)
├── Dashboard (auth optional)
└── Account (Login / Profile)

Footer
├── About / Methodology
├── FAQ
└── Legal placeholder
```

Grammar remains **public**; exams CTA shows login when unauthenticated (current behavior, improved copy).

---

## 4. Gamification data model (proposal)

**V1 (client, matches today):**

```ts
type LearningGamification = {
  streakDays: number;
  lastStudyDate: string; // ISO date
  xp: number;
  dailyGoalMinutes: number;
  todayMinutes: number;
  completedTenses: string[];
  completedGroups: string[];
  badges: string[]; // slug ids
};
```

Merge into `lib/progress.ts` or `lib/learning-stats.ts`; migrate from old key with version field.

**V2:** `PUT /api/v1/user/progress/grammar` when logged in — optional sync, not blocking UI.

**No fabricated leaderboard** until API exists.

---

## 5. Component architecture summary

See [COMPONENT_ARCHITECTURE.md](./COMPONENT_ARCHITECTURE.md).

Principles:

- `components/ui/*` — shadcn primitives only.
- `components/learning/*` — domain cards (TenseCard, QuizQuestion, XpBadge).
- `components/layout/*` — header, footer, page shell.
- Pages stay thin; Server Components default.

---

## 6. Dependencies to add (planned)

| Package | When |
|---------|------|
| shadcn/ui (generated) | Phase 3 |
| `lucide-react` | With shadcn |
| `recharts` | Phase 4 P9 (dynamic import) |
| `motion` | Only if micro-interactions approved (streak celebration) |

**Do not add** MUI, Chakra, or parallel icon sets.

---

## 7. Migration rules for existing UI

1. Replace `SiteHeader` styles incrementally — keep links/hrefs.
2. Keep `QuizRunner` API payload shape.
3. Keep `grammar-data.ts` until API-driven grammar is a deliberate migration.
4. Preserve `instant = false` patterns on sensitive routes when touching layouts.
5. i18n: every new string → `messages/vi.json` + `en.json`.

---

## 8. Success metrics

- Beginner can start grammar from home in **≤2 clicks**.
- Dashboard shows **Continue learning** above the fold (logged in or guest with local progress).
- Quiz session: visible **progress** + **explanation** after submit.
- Lighthouse: no major regression on grammar SSG pages after font/component additions.
- Design tokens used in **≥80%** of new UI (no random hex in pages).

---

## 9. Approval gate before Phase 3 code

Confirm with product owner:

1. Gamification V1 local-only OK?  
2. Dashboard route public for guests?  
3. Roadmap 7 levels — static marketing or tied to content?  
4. shadcn Base UI install on current Next 16 / Tailwind 4 stack.

After approval, begin **Phase 3 — Design System Implementation** in Agent mode.

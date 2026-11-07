# Component Architecture — Proposal

**Target tree** under `apps/web/src/` (after Phase 3).

```
components/
├── ui/                    # shadcn-generated (do not hand-edit except variants)
├── layout/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── mobile-nav.tsx
│   └── page-shell.tsx     # title, description, actions slot
├── learning/
│   ├── tense-card.tsx
│   ├── tense-structure-block.tsx
│   ├── example-list.tsx
│   ├── quiz-progress.tsx
│   ├── quiz-question.tsx
│   ├── quiz-results.tsx
│   ├── streak-badge.tsx
│   ├── xp-display.tsx
│   └── continue-learning-card.tsx
├── exams/
│   ├── exam-card.tsx
│   └── exam-type-tabs.tsx
└── theme-init.tsx         # existing pattern

lib/
├── grammar-data.ts        # keep
├── grammar-i18n.ts
├── progress.ts            # extend → learning-stats.ts
├── api.ts
└── theme-storage.ts
```

---

## Responsibility rules

| Layer | Responsibility |
|-------|----------------|
| `app/[locale]/**/page.tsx` | Data loading, metadata, compose sections |
| `*-client.tsx` | Client-only boundaries (auth, fetch, quiz) |
| `components/learning/*` | Presentational + light UI state |
| `components/ui/*` | No business logic |
| `lib/*` | Pure functions, API helpers, storage |

---

## Server vs client

- **Default Server Component** for marketing, grammar static pages, dashboard shell.
- **Client** for: quiz inputs, charts, theme, localStorage progress, exam attempts, OAuth callback.

---

## i18n

- Components receive **translated strings as props** or use `useTranslations` only in client leaves.
- Server pages call `getTranslations`.

---

## Migration from current files

| Current | Action |
|---------|--------|
| `site-header.tsx` | Move to `layout/`, add mobile nav |
| `quiz-runner.tsx` | Split into `quiz-question`, `quiz-results`, thin orchestrator |
| `progress-badge.tsx` | Evolve to `learning/continue-learning-card` + stats |
| `tense-detail-content.tsx` | Extract `example-list`, `tense-structure-block` |

No deletion of routes during refactor.

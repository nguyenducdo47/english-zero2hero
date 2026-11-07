# Design System — Proposal (not yet implemented)

**Status:** Specification for Phase 3. Current app uses ad hoc Tailwind + CSS variables in `apps/web/src/app/globals.css`.

---

## 1. Color tokens (semantic)

| Token | Light | Dark | Usage |
|-------|-------|------|--------|
| `--primary` | `#2563EB` | `#3B82F6` | Primary CTAs, links |
| `--secondary` | `#14B8A6` | `#2DD4BF` | Success, secondary actions |
| `--warning` | `#F59E0B` | `#FBBF24` | Pitfalls, cautions |
| `--accent` | `#F97316` | `#FB923C` | XP, streak highlights |
| `--background` | `#F8FAFC` | `#0F172A` | Page bg |
| `--surface` | `#FFFFFF` | `#1E293B` | Cards |
| `--foreground` | `#0F172A` | `#F1F5F9` | Primary text |
| `--muted-foreground` | `#64748B` | `#94A3B8` | Secondary text |
| `--border` | `#E2E8F0` | `#334155` | Borders |

Map into Tailwind `@theme` and shadcn CSS variables (`--primary`, `--muted`, etc.).

---

## 2. Typography

| Role | Font | Weights |
|------|------|---------|
| Display / H1–H2 | Plus Jakarta Sans | 600–700 |
| Body | Inter | 400–500 |
| UI labels | Inter | 500 |
| IPA / phonetics | Noto Sans | 400 |

Scale (example):  
`text-display` 2.25rem, `text-h1` 1.875rem, `text-h2` 1.5rem, `text-body` 1rem (leading 1.6), `text-small` 0.875rem.

---

## 3. Radius & elevation

- Cards / panels: **12px** (`rounded-xl`)
- Buttons / inputs: **10px**
- Modals: **16px**
- Shadow: `shadow-sm` default; `shadow-md` on hover cards only

---

## 4. Spacing scale

Use Tailwind default (4px base). Page padding: `px-4 md:px-6`, section `space-y-8`, card `p-5 md:p-6`.

Max content width: `max-w-6xl` for marketing; `max-w-3xl` for lesson reading column.

---

## 5. Component variants (shadcn)

| Component | Variants |
|-----------|----------|
| Button | default, secondary, outline, ghost, destructive, link |
| Badge | default, secondary, success, warning, outline |
| Card | default, interactive (hover border primary/20) |
| Alert | info, warning (grammar pitfalls), success |

---

## 6. Learning-specific patterns

- **Structure highlight:** monospace block, left border `primary`, bg `surface-muted`.
- **Example row:** EN bold, VI `muted-foreground`, optional TTS icon button.
- **Quiz:** full-width progress `Progress` on top; disable nav chrome in “focus mode.”
- **XP / streak:** small `Badge` + `accent` color, no full-screen animations.

---

## 7. Dark mode

Keep `class="dark"` on `<html>`. All tokens have dark counterparts; shadcn themes `default` + custom.

---

## 8. Accessibility

- Focus ring: `ring-2 ring-primary ring-offset-2`
- Min touch target 44px on mobile CTAs
- Form errors: `Alert` + `aria-invalid` on inputs

Implementation tracked in Phase 3.

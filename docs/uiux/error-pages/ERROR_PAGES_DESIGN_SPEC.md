# Error Pages — Design Specification

## Concept matrix

| Code | Concept | Accent | Illustration |
|------|---------|--------|--------------|
| 404 | Lost in Learning | Primary blue | Book + map pin |
| 403 / 401 | Locked content | Warning amber | Locked book |
| 500 | System malfunction | Neutral + secondary | Desk + tools |
| 503 | Library maintenance | Secondary teal | Closed library |

## Layout (all pages)

1. Brand link (home)
2. Illustration (decorative, `aria-hidden`)
3. Status code badge (gradient pill)
4. Title (EN)
5. Description (EN)
6. Vietnamese block (`border-l` secondary)
7. CTAs (primary first)
8. Optional learning shortcuts (404 only)

## CTAs

| Page | Primary | Secondary |
|------|---------|-----------|
| 404 | Back to Home | Explore Lessons + shortcuts |
| 403 | Go to Dashboard | Back to Home |
| 401 (admin gate) | Sign In | Back to Home |
| 500 (boundary) | Try Again | Back to Home |
| 500 (route) | Back to Home | Dashboard |
| 503 | Try Again (reload) | Back to Home |

## Tokens

Reuse semantic Tailwind: `primary`, `secondary`, `warning`, `background`, `card`, `border`, `muted-foreground`. Radius `rounded-xl` / `rounded-2xl`.

## Accessibility

- Semantic `main`, `header`, `nav` for shortcuts.
- Focus rings on links/buttons (`focus-visible:ring-3`).
- Illustrations decorative only.
- `motion-reduce` respected on loading state.

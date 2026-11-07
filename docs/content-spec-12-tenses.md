# Content spec — 12 thì (EN + VI)

## 1. Danh sách 12 thì & nhóm

| # | Slug | Tên VI | Group |
|---|------|--------|-------|
| 1 | `present-simple` | Hiện tại đơn | present |
| 2 | `present-continuous` | Hiện tại tiếp diễn | present |
| 3 | `present-perfect` | Hiện tại hoàn thành | present |
| 4 | `past-simple` | Quá khứ đơn | past |
| 5 | `past-continuous` | Quá khứ tiếp diễn | past |
| 6 | `past-perfect` | Quá khứ hoàn thành | past |
| 7 | `future-simple` | Tương lai đơn | future |
| 8 | `future-continuous` | Tương lai tiếp diễn | future |
| 9 | `future-perfect` | Tương lai hoàn thành | future |
| 10 | `present-perfect-continuous` | Hiện tại hoàn thành tiếp diễn | perfect-continuous |
| 11 | `past-perfect-continuous` | Quá khứ hoàn thành tiếp diễn | perfect-continuous |
| 12 | `future-perfect-continuous` | Tương lai hoàn thành tiếp diễn | perfect-continuous |

## 2. Schema nội dung mỗi thì (JSON)

```json
{
  "slug": "present-simple",
  "name_en": "Present Simple",
  "name_vi": "Hiện tại đơn",
  "group_slug": "present",
  "sort_order": 1,
  "structure": "S + V(s/es) / S + do not + V / Do + S + V?",
  "usage_vi": ["Thói quen", "Sự thật hiển nhiên", "Lịch trình cố định"],
  "signals": ["every day", "usually", "often", "always"],
  "pitfalls_vi": "Không thêm -ing; nhớ chia động từ s/es ngôi thứ 3 số ít.",
  "examples": [
    { "en": "She works in Hanoi.", "vi": "Cô ấy làm việc ở Hà Nội." },
    { "en": "Water boils at 100°C.", "vi": "Nước sôi ở 100°C." }
  ]
}
```

## 3. Quiz bank template (CSV / JSON)

```json
{
  "tense_group_slug": "present",
  "type": "multiple_choice",
  "prompt_en": "She ___ to school every day.",
  "prompt_vi": "Cô ấy ___ đến trường mỗi ngày.",
  "options": ["go", "goes", "going", "went"],
  "correct_index": 1,
  "explanation_vi": "Thói quen + chủ ngữ số ít → goes."
}
```

**Types:** `multiple_choice` | `fill_blank`  
**Fill blank:** `correct_answers[]` + optional `synonyms[]` (normalized lowercase).

## 4. Quy tắc biên soạn

- Giải thích `usage_vi`, `pitfalls_vi`, `explanation_vi` bằng tiếng Việt, ví dụ EN.
- Mỗi thì ≥ 2 examples.
- Mỗi `tense_group` ≥ 15 câu trong pool; quiz random lấy 10 câu/session.

## 5. File nguồn trong repo

- Master data: [`packages/content/grammar.json`](../packages/content/grammar.json)
- Laravel: `GrammarContentSeeder` đọc file trên.
- Next.js: import cùng file lúc build (SSG).

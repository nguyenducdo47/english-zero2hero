# Grammar question crawl (JSON + HTML feeds)

The grammar quiz pool can grow from **Admin-managed feeds**, optional **legacy env URLs**, and the **local JSON file** (`packages/content/quiz-questions.json` by default).

## Admin

1. Open **Admin → Content → Questions** (grammar scope).
2. Use **Question feeds** to add sources: name, URL, adapter, optional default tense group, license notes.
3. **Crawl this feed** imports one source; **Crawl question bank** runs all enabled DB feeds, then env URLs, then the local file.
4. Per-feed **last_result** shows `imported` / `skipped` / `errors` from the last run.

Scheduled job: `CrawlGrammarQuestionsJob` calls the same `importAllFeeds()` path as manual crawl (non-local env queues the job).

## Security: host whitelist

`E2H_CRAWL_WHITELIST` in `apps/api/.env` is a comma-separated list of allowed **hosts** (no scheme), e.g. `cdn.example.com,raw.githubusercontent.com`.

- If the list is **empty**, all hosts are allowed (useful locally; set explicitly in production).
- Requests outside the whitelist fail with a clear error stored in `last_result.errors`.

HTTP settings (in `.env` / `config/grammar.php`):

| Variable | Default | Purpose |
|----------|---------|---------|
| `GRAMMAR_CRAWL_DELAY_MS` | `500` | Sleep between feed requests |
| `GRAMMAR_CRAWL_TIMEOUT` | `30` | Request timeout (seconds) |
| `GRAMMAR_CRAWL_USER_AGENT` | `EnglishZero2Hero/1.0 (+grammar-quiz-crawl)` | User-Agent header |

## JSON adapter (`json_feed`)

Feed URL must return JSON:

```json
{
  "questions": [ /* items */ ]
}
```

Each item matches the schema in [`packages/content/quiz-questions.json`](../packages/content/quiz-questions.json):

| Field | Required | Notes |
|-------|----------|-------|
| `tense_group_slug` | Yes* | Slug of a tense group; or set feed **default_tense_group_slug** |
| `type` | Yes | `multiple_choice` or `fill_blank` |
| `prompt_en` | Yes | English prompt |
| `prompt_vi` | Recommended | Vietnamese prompt |
| `options` + `correct_index` | MC | |
| `correct_answers` (+ optional `synonyms`) | Fill blank | |
| `explanation_vi` / `explanation_en` | Optional | |

Dedupe: each item gets a stable `source_hash`; duplicates are **skipped**, not duplicated.

## HTML adapter (`html_json_ld`)

For pages that embed structured data in `<script type="application/ld+json">`:

- Top-level `questions` array (same item shape as JSON feeds), or
- schema.org `Quiz` / `Question` graphs (best-effort mapping).

Use this only for sites you are allowed to crawl and that expose quiz data in JSON-LD.

## Adding a custom HTML adapter

1. Implement `App\Services\GrammarQuestion\GrammarQuestionFeedAdapterInterface`:
   - `key(): string` — unique adapter key (e.g. `html_my_site`)
   - `fetch(string $url): array{questions: array, errors: list<string>}`
2. Register the class in `apps/api/config/grammar.php` under `feed_adapters`:

```php
'feed_adapters' => [
    'html_my_site' => \App\Services\GrammarQuestion\HtmlMySiteAdapter::class,
],
```

3. Create a feed in Admin with adapter `html_my_site`.

Built-in adapters are wired in `GrammarQuestionFeedAdapterRegistry` (`json_feed`, `html_json_ld`).

## Legacy env URLs

`GRAMMAR_QUESTION_FEED_URLS` (comma-separated) still works but is **deprecated** in favor of Admin feeds. Same JSON schema and whitelist rules apply.

## Local file

On every **crawl all** / `grammar:import-questions`, the API imports local JSON feeds:

- `packages/content/quiz-questions.json` (seed starter set)
- `packages/content/quiz-questions-bank.json` (~1000 generated items)

`GRAMMAR_QUESTION_FEED_LOCAL` overrides to a single absolute path. Otherwise use `GRAMMAR_QUESTION_FEED_LOCAL_PATHS` (comma-separated filenames under `packages/content/`).

Regenerate the large bank (no AI):

```bash
php packages/content/bin/generate-quiz-bank.php
# Sau khi đổi bank (bỏ câu cũ có đề khác), thay pool và import lại:
php artisan grammar:replace-bank-pool --force
# Hoặc chỉ import thêm (không xóa):
php artisan grammar:import-questions
# Cập nhật bản dịch mà không đổi prompt_en:
php artisan grammar:sync-quiz-translations
```

Items use `[Cơ bản]`, `[Trung cấp]`, `[Nâng cao]` in `explanation_vi` by position in the generator.

## Artisan

```bash
cd apps/api
php artisan grammar:import-questions
```

Same import logic as Admin crawl (enabled feeds + env + local).

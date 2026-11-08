# Grammar translate & analyze

Learners paste English or Vietnamese text on **`/grammar/analyze`**. The Laravel API translates via **MyMemory** (free, default) with optional **self-hosted or keyed LibreTranslate**, then returns a **heuristic** grammar breakdown linked to site tense slugs.

## API

- **Endpoint:** `POST /api/v1/grammar/analyze`
- **Auth:** optional Sanctum (higher daily quota for signed-in users)
- **Body:** `text`, `mode` (`word`|`sentence`|`paragraph`), `source_lang`, `target_lang` (`auto`|`en`|`vi`)

### Responses

- **200** — `data` (analysis payload) and `meta.quota` (`limit`, `remaining`, `resets_at`, …)
- **429** — daily quota exceeded (`api.grammar_analyze_quota`)
- **503** — tool disabled in Admin (`api.grammar_tool_disabled`)

`translation_source` is `mymemory`, `libretranslate`, or `placeholder`. `provider` is `stub` while `AI_PROVIDER=stub`.

### Free translation options (EN↔VI)

| Option | Cost | In E2H |
|--------|------|--------|
| [MyMemory](https://mymemory.translated.net/) | Free tier (~5k chars/day; more with `GRAMMAR_TOOL_MYMEMORY_CONTACT_EMAIL`) | **Default** |
| LibreTranslate **self-hosted** (Docker) | Free on your server | Admin URL → your instance (no key) |
| [LibreTranslate.com](https://portal.libretranslate.com) | Paid API key | Only if key saved in Admin |
| [Azure Translator F0](https://azure.microsoft.com/products/ai-services/translator) | ~2M chars/month free | Not wired yet |
| OpenAI / DeepL | Paid | Planned later |

## Configuration

| Layer | What |
|--------|------|
| `.env` | `GRAMMAR_TOOL_*` — see `apps/api/.env.example` |
| Admin → Integrations → Grammar tool | DB overrides: enable, quotas, LibreTranslate URL |
| `apps/api/config/grammar_tool.php` | Max chars per mode, HTTP timeout |

Rate limits reset end of day **Asia/Ho_Chi_Minh** (guest = hashed IP, user = user id).

## Web

- Page: `apps/web/src/app/[locale]/(portal)/grammar/analyze/`
- Client: `grammar-analyze-form.tsx`, `grammar-analyze-result.tsx`
- Types: `apps/web/src/lib/grammar-analysis.ts`

## SEO

Static route key `grammar-analyze` in `apps/api/config/seo_routes.php` (mirrored in `seo-route-registry.ts`).

## Smoke test

```bash
curl -s -X POST http://localhost:8000/api/v1/grammar/analyze \
  -H "Content-Type: application/json" \
  -H "Accept-Language: vi" \
  -d '{"text":"I have studied English for two years.","mode":"sentence","source_lang":"auto","target_lang":"auto"}'
```

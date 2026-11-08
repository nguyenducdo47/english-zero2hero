<?php

namespace App\Services;

use App\Models\SeoPage;
use App\Models\SeoSitemapUrl;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class SeoSitemapService
{
    public function __construct(
        private readonly SeoService $seo,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function overview(): array
    {
        $base = $this->seo->canonicalBase();
        $included = [];
        $excluded = [];

        foreach ($this->seo->registry() as $item) {
            if ($item['noindex'] ?? false) {
                foreach (['vi', 'en'] as $locale) {
                    $excluded[] = $this->registryRow($item, $locale, 'static_noindex');
                }

                continue;
            }

            foreach (['vi', 'en'] as $locale) {
                $resolved = $this->seo->resolveRouteKey($item['route_key'], $locale);
                if ($resolved['robots']['index'] ?? true) {
                    $included[] = $this->registryRow($item, $locale, null, true);
                } else {
                    $excluded[] = $this->registryRow($item, $locale, 'robots_index');
                }
            }
        }

        foreach ($this->seo->sitemapCustomEntries() as $row) {
            $included[] = [
                'url' => $row['url'],
                'route_key' => null,
                'locale' => $row['locale'] ?? null,
                'source' => 'custom',
                'custom_id' => $row['custom_id'] ?? null,
                'last_modified' => $row['lastModified'] ?? null,
                'priority' => $row['priority'] ?? null,
                'changefreq' => $row['changefreq'] ?? null,
                'label' => null,
            ];
        }

        $custom = $this->listCustom();
        foreach ($custom as $row) {
            if (! ($row['is_enabled'] ?? true)) {
                $excluded[] = [
                    'url' => $row['loc'],
                    'route_key' => null,
                    'locale' => $row['locale'],
                    'source' => 'custom',
                    'custom_id' => $row['id'],
                    'reason' => 'disabled',
                    'label' => $row['name'] ?? $row['loc'],
                ];
            }
        }

        return [
            'canonical_base' => $base,
            'sitemap_xml' => $base.'/sitemap.xml',
            'stats' => [
                'included' => count($included),
                'excluded' => count($excluded),
                'custom' => count($custom),
            ],
            'included' => $included,
            'excluded' => $excluded,
            'custom' => $custom,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listCustom(): array
    {
        if (! Schema::hasTable('seo_sitemap_urls')) {
            return [];
        }

        return SeoSitemapUrl::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(fn (SeoSitemapUrl $row) => $this->serializeCustom($row))
            ->values()
            ->all();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function storeCustom(array $data): array
    {
        $data = array_merge([
            'is_enabled' => true,
            'sort_order' => 0,
        ], $data);
        $this->assertUniqueLoc($data['loc'], $data['locale'] ?? null, null);
        $row = SeoSitemapUrl::query()->create($this->fillableFromInput($data));
        $this->seo->forgetCache();

        return $this->serializeCustom($row);
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function updateCustom(SeoSitemapUrl $row, array $data): array
    {
        if (isset($data['loc']) || array_key_exists('locale', $data)) {
            $this->assertUniqueLoc(
                $data['loc'] ?? $row->loc,
                array_key_exists('locale', $data) ? $data['locale'] : $row->locale,
                $row->id
            );
        }
        $row->update($this->fillableFromInput($data, $row));
        $this->seo->forgetCache();

        return $this->serializeCustom($row->fresh());
    }

    public function destroyCustom(SeoSitemapUrl $row): void
    {
        $row->delete();
        $this->seo->forgetCache();
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeCustom(SeoSitemapUrl $row): array
    {
        return [
            'id' => $row->id,
            'name' => $row->name,
            'loc' => $row->loc,
            'locale' => $row->locale,
            'priority' => $row->priority,
            'changefreq' => $row->changefreq,
            'is_enabled' => $row->is_enabled,
            'sort_order' => $row->sort_order,
            'updated_at' => $row->updated_at?->toAtomString(),
        ];
    }

    /**
     * @param  array<string, mixed>  $item
     * @return array<string, mixed>
     */
    private function registryRow(array $item, string $locale, ?string $reason, bool $withMeta = false): array
    {
        $url = $this->seo->localizedAbsoluteUrl($item['path'], $locale);
        $page = SeoPage::query()
            ->where('route_key', $item['route_key'])
            ->where('locale', $locale)
            ->first();

        $row = [
            'url' => $url,
            'route_key' => $item['route_key'],
            'locale' => $locale,
            'source' => 'registry',
            'label' => $item['label'] ?? $item['route_key'],
        ];

        if ($withMeta) {
            $row['last_modified'] = $page?->updated_at?->toAtomString();
            $row['priority'] = null;
            $row['changefreq'] = null;
        }

        if ($reason !== null) {
            $row['reason'] = $reason;
        }

        return $row;
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function fillableFromInput(array $data, ?SeoSitemapUrl $existing = null): array
    {
        $out = [];
        foreach (['name', 'loc', 'locale', 'priority', 'changefreq', 'is_enabled', 'sort_order'] as $key) {
            if (array_key_exists($key, $data)) {
                $out[$key] = $data[$key];
            }
        }

        if (isset($out['loc']) && is_string($out['loc'])) {
            $loc = trim($out['loc']);
            if ($loc !== '' && ! str_starts_with($loc, 'http') && ! str_starts_with($loc, '/')) {
                $out['loc'] = '/'.$loc;
            } else {
                $out['loc'] = $loc;
            }
        }

        if (array_key_exists('locale', $out) && $out['locale'] === '') {
            $out['locale'] = null;
        }

        return $out;
    }

    private function assertUniqueLoc(string $loc, ?string $locale, ?int $exceptId): void
    {
        $loc = trim($loc);
        if ($loc !== '' && ! str_starts_with($loc, 'http') && ! str_starts_with($loc, '/')) {
            $loc = '/'.$loc;
        }

        $query = SeoSitemapUrl::query()->where('loc', $loc);
        if ($locale === null || $locale === '') {
            $query->whereNull('locale');
        } else {
            $query->where('locale', $locale);
        }
        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }
        if ($query->exists()) {
            throw ValidationException::withMessages([
                'loc' => ['This location already exists for the selected locale.'],
            ]);
        }
    }
}

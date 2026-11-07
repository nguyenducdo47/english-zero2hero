<?php

namespace App\Services;

use App\Models\SeoGlobal;
use App\Models\SeoPage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class SeoService
{
    private const CACHE_RESOLVE = 'seo.resolve.';

    public function globalSettings(): SeoGlobal
    {
        if (! Schema::hasTable('seo_global')) {
            return new SeoGlobal([
                'site_name' => 'English Zero2Hero',
                'robots_default_index' => true,
                'robots_default_follow' => true,
                'default_locale' => 'vi',
                'twitter_card' => 'summary_large_image',
            ]);
        }

        return SeoGlobal::query()->firstOrCreate(
            ['id' => 1],
            [
                'site_name' => 'English Zero2Hero',
                'default_title' => 'English Zero2Hero',
                'default_description' => 'Ôn 12 thì tiếng Anh, luyện TOEIC/IELTS.',
                'robots_default_index' => true,
                'robots_default_follow' => true,
                'default_locale' => 'vi',
                'twitter_card' => 'summary_large_image',
            ]
        );
    }

    public function updateGlobal(array $input): SeoGlobal
    {
        $global = $this->globalSettings();
        $global->fill($input);
        $global->save();
        $this->forgetCache();

        return $global;
    }

    public function forgetCache(): void
    {
        Cache::flush();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function registry(): array
    {
        $items = [];
        foreach (config('seo_routes.static', []) as $row) {
            $items[] = [
                'route_key' => $row['route_key'],
                'label' => $row['label'],
                'path' => $row['path'],
                'dynamic' => false,
                'noindex' => $row['noindex'] ?? false,
            ];
        }

        foreach (config('seo_routes.dynamic', []) as $type => $meta) {
            $model = $meta['model'];
            $query = $model::query();
            if (! empty($meta['published_only'])) {
                $query->where('is_published', true);
            }
            foreach ($query->orderBy('slug')->pluck($meta['slug_column']) as $slug) {
                $routeKey = str_replace('{slug}', $slug, $meta['pattern']);
                $path = str_replace('{slug}', $slug, $meta['path_pattern']);
                $items[] = [
                    'route_key' => $routeKey,
                    'label' => $meta['label'].': '.$slug,
                    'path' => $path,
                    'dynamic' => true,
                    'noindex' => false,
                ];
            }
        }

        return $items;
    }

    public function resolvePath(string $path, string $locale): array
    {
        $path = $this->stripLocalePrefix($path);

        $cacheKey = self::CACHE_RESOLVE.md5($path.'|'.$locale);

        return Cache::remember($cacheKey, 60, function () use ($path, $locale) {
            return $this->resolvePathUncached($path, $locale);
        });
    }

    public function resolveRouteKey(string $routeKey, string $locale): array
    {
        $path = $this->pathForRouteKey($routeKey) ?? '/';

        return $this->resolvePathUncached($path, $locale, $routeKey);
    }

    private function resolvePathUncached(string $path, string $locale, ?string $forcedRouteKey = null): array
    {
        $global = $this->globalSettings();
        $routeKey = $forcedRouteKey ?? $this->pathToRouteKey($path);
        $page = $this->pageOverride($routeKey, $locale);

        $noindex = $this->pathIsNoindex($path, $global, $page);

        $dynamic = str_starts_with($routeKey, 'grammar.tense.')
            || str_starts_with($routeKey, 'exams.');

        $title = $page?->title;
        if ($title === null && ! $dynamic) {
            $title = $global->default_title ?? $global->site_name;
        }

        $description = $page?->description;
        if ($description === null && ! $dynamic) {
            $description = $global->default_description;
        }
        $ogTitle = $page?->og_title ?? $global->og_title ?? $title;
        $ogDescription = $page?->og_description ?? $global->og_description ?? $description;
        $ogImage = $page?->og_image_url ?? $global->og_image_url;

        $canonicalBase = rtrim($global->canonical_base ?: config('app.url', ''), '/');
        $canonicalPath = $page?->canonical_path ?? $this->localizePath($path, $locale, $global->default_locale);
        $canonical = $canonicalBase !== '' ? $canonicalBase.$canonicalPath : null;

        $index = $noindex ? false : ($page?->robots_index ?? $global->robots_default_index);
        $follow = $noindex ? false : ($page?->robots_follow ?? $global->robots_default_follow);

        return [
            'route_key' => $routeKey,
            'locale' => $locale,
            'path' => $path,
            'title' => $title,
            'description' => $description,
            'keywords' => $global->default_keywords,
            'open_graph' => [
                'title' => $ogTitle,
                'description' => $ogDescription,
                'image' => $ogImage,
            ],
            'twitter' => [
                'card' => $global->twitter_card,
            ],
            'canonical' => $canonical,
            'robots' => [
                'index' => $index,
                'follow' => $follow,
            ],
            'structured_data' => $page?->structured_data,
            'page_override' => $page !== null,
            'json_ld' => $this->buildJsonLd($global, $title, $description, $canonical, $page, $routeKey),
            'alternates' => $this->hreflangAlternates($canonicalBase, $path, $global->default_locale),
            'site_name' => $global->site_name,
            'favicon_url' => $global->favicon_url,
            'site_logo_url' => $global->site_logo_url,
        ];
    }

    /**
     * @return array{url: string, field: string, data: SeoGlobal}
     */
    public function storeBrandingAsset(string $type, UploadedFile $file): array
    {
        $fields = [
            'favicon' => 'favicon_url',
            'site_logo' => 'site_logo_url',
            'organization_logo' => 'organization_logo_url',
            'og_image' => 'og_image_url',
        ];

        if (! isset($fields[$type])) {
            throw new \InvalidArgumentException('Invalid asset type');
        }

        $field = $fields[$type];
        $directory = "seo/{$type}";
        Storage::disk('public')->makeDirectory($directory);

        $ext = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'png');
        if ($ext === '' || $ext === 'jpeg') {
            $ext = $ext === 'jpeg' ? 'jpg' : 'png';
        }

        $filename = Str::uuid()->toString().'.'.$ext;
        $relativePath = "{$directory}/{$filename}";

        $pathname = $file->getPathname();
        if ($pathname === '' || ! is_readable($pathname)) {
            throw new \RuntimeException(
                'Upload temp file is missing. Check PHP upload_tmp_dir, post_max_size, and upload_max_filesize.',
            );
        }

        // getRealPath() is often empty on Windows uploads — stream from pathname / contents.
        $written = Storage::disk('public')->put($relativePath, $file->getContent());

        if ($written === false) {
            throw new \RuntimeException('Could not save file to public disk.');
        }

        $stored = $relativePath;
        $url = Storage::disk('public')->url($stored);

        $global = $this->globalSettings();
        $global->{$field} = $url;
        $global->save();
        $this->forgetCache();

        return ['url' => $url, 'field' => $field, 'data' => $global];
    }

    private function pageOverride(string $routeKey, string $locale): ?SeoPage
    {
        if (! Schema::hasTable('seo_pages')) {
            return null;
        }

        return SeoPage::query()
            ->where('route_key', $routeKey)
            ->whereIn('locale', [$locale, '*'])
            ->orderByRaw('CASE WHEN locale = ? THEN 0 ELSE 1 END', [$locale])
            ->first();
    }

    public function upsertPage(array $data): SeoPage
    {
        if (isset($data['structured_data']) && is_string($data['structured_data'])) {
            $decoded = json_decode($data['structured_data'], true);
            $data['structured_data'] = is_array($decoded) ? $decoded : null;
        }

        $page = SeoPage::query()->updateOrCreate(
            [
                'route_key' => $data['route_key'],
                'locale' => $data['locale'],
            ],
            $data
        );
        $this->forgetCache();

        return $page;
    }

    public function listPages(?string $routeKey = null, ?string $locale = null)
    {
        $query = SeoPage::query()->orderBy('route_key')->orderBy('locale');
        if ($routeKey) {
            $query->where('route_key', $routeKey);
        }
        if ($locale) {
            $query->where('locale', $locale);
        }

        return $query->get();
    }

    public function deletePage(string $routeKey, string $locale): void
    {
        SeoPage::query()->where('route_key', $routeKey)->where('locale', $locale)->delete();
        $this->forgetCache();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function validate(): array
    {
        $issues = [];
        $global = $this->globalSettings();

        if (! $global->default_title) {
            $issues[] = ['type' => 'missing', 'field' => 'global.default_title', 'message' => 'Missing global default title'];
        }
        if (! $global->default_description) {
            $issues[] = ['type' => 'missing', 'field' => 'global.default_description', 'message' => 'Missing global default description'];
        }

        $titles = [];
        foreach ($this->registry() as $item) {
            if ($item['noindex'] ?? false) {
                continue;
            }
            foreach (['vi', 'en'] as $locale) {
                $resolved = $this->resolveRouteKey($item['route_key'], $locale);
                $t = $resolved['title'] ?? '';
                if ($t === '') {
                    $issues[] = [
                        'type' => 'missing',
                        'route_key' => $item['route_key'],
                        'locale' => $locale,
                        'field' => 'title',
                    ];
                } else {
                    $key = $locale.'|'.$t;
                    if (isset($titles[$key])) {
                        $issues[] = [
                            'type' => 'duplicate',
                            'field' => 'title',
                            'locale' => $locale,
                            'route_key' => $item['route_key'],
                            'duplicate_of' => $titles[$key],
                        ];
                    }
                    $titles[$key] = $item['route_key'];
                }
            }
        }

        if ($global->twitter_card === 'summary_large_image' && ! $global->og_image_url) {
            $issues[] = ['type' => 'warning', 'field' => 'global.og_image_url', 'message' => 'OG image recommended for large card'];
        }

        return $issues;
    }

    /**
     * @return array<int, array{url: string, lastModified?: string, index: bool}>
     */
    public function sitemapEntries(): array
    {
        $global = $this->globalSettings();
        $base = rtrim($global->canonical_base ?: config('app.url', ''), '/');
        $entries = [];

        foreach ($this->registry() as $item) {
            if ($item['noindex'] ?? false) {
                continue;
            }
            foreach (['vi', 'en'] as $locale) {
                $resolved = $this->resolveRouteKey($item['route_key'], $locale);
                if (! ($resolved['robots']['index'] ?? true)) {
                    continue;
                }
                $localized = $base.$this->localizePath($item['path'], $locale, $global->default_locale);
                $page = SeoPage::query()->where('route_key', $item['route_key'])->where('locale', $locale)->first();
                $entries[] = [
                    'url' => $localized,
                    'lastModified' => $page?->updated_at?->toAtomString(),
                    'index' => true,
                ];
            }
        }

        return $entries;
    }

    public function robotsRules(): array
    {
        $global = $this->globalSettings();

        if ($global->maintenance_noindex) {
            return [
                'rules' => [
                    ['userAgent' => '*', 'disallow' => '/'],
                ],
            ];
        }

        $disallow = config('seo_routes.noindex_paths', []);

        return [
            'rules' => [
                ['userAgent' => '*', 'allow' => '/', 'disallow' => $disallow],
            ],
            'sitemap' => rtrim($global->canonical_base ?: config('app.url', ''), '/').'/sitemap.xml',
        ];
    }

    private function stripLocalePrefix(string $path): string
    {
        $trimmed = trim($path, '/');
        if ($trimmed === '') {
            return '/';
        }
        $segments = explode('/', $trimmed);
        if (count($segments) > 0 && in_array($segments[0], ['vi', 'en'], true)) {
            array_shift($segments);
            if ($segments === []) {
                return '/';
            }

            return '/'.implode('/', $segments);
        }

        return '/'.$trimmed;
    }

    private function pathToRouteKey(string $path): string
    {
        $path = $this->stripLocalePrefix($path);
        if ($path === '/' || $path === '') {
            return 'home';
        }

        $normalized = trim($path, '/');
        $segments = explode('/', $normalized);
        if (count($segments) >= 2 && $segments[0] === 'grammar') {
            return 'grammar.tense.'.$segments[1];
        }
        if (count($segments) >= 2 && $segments[0] === 'exams') {
            return 'exams.'.$segments[1];
        }

        foreach (config('seo_routes.static', []) as $row) {
            $static = trim($row['path'], '/');
            if ($static === $normalized || ($row['path'] === '/' && $path === '/')) {
                return $row['route_key'];
            }
        }

        return str_replace('/', '.', $normalized);
    }

    public function pathForRouteKey(string $routeKey): ?string
    {
        if ($routeKey === 'home') {
            return '/';
        }

        foreach (config('seo_routes.static', []) as $row) {
            if ($row['route_key'] === $routeKey) {
                return $row['path'];
            }
        }

        if (str_starts_with($routeKey, 'grammar.tense.')) {
            $slug = Str::after($routeKey, 'grammar.tense.');

            return '/grammar/'.$slug;
        }

        if (str_starts_with($routeKey, 'exams.')) {
            $slug = Str::after($routeKey, 'exams.');

            return '/exams/'.$slug;
        }

        return null;
    }

    private function localizePath(string $path, string $locale, string $defaultLocale): string
    {
        $path = $path === '/' ? '' : $path;
        if ($locale === $defaultLocale) {
            return $path;
        }

        return '/'.$locale.$path;
    }

    private function pathIsNoindex(string $path, SeoGlobal $global, ?SeoPage $page): bool
    {
        if ($global->maintenance_noindex) {
            return true;
        }

        foreach (config('seo_routes.noindex_paths', []) as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix.'/')) {
                return true;
            }
        }

        if ($page?->robots_index === false) {
            return true;
        }

        return false;
    }

    /**
     * @return array<string, string>
     */
    private function hreflangAlternates(string $base, string $path, string $defaultLocale): array
    {
        if ($base === '') {
            return [];
        }

        $out = [];
        foreach (['vi', 'en'] as $locale) {
            $out[$locale] = $base.$this->localizePath($path, $locale, $defaultLocale);
        }

        return $out;
    }

    private function buildJsonLd(
        SeoGlobal $global,
        ?string $title,
        ?string $description,
        ?string $canonical,
        ?SeoPage $page,
        string $routeKey = 'home',
    ): array {
        $blocks = [];

        if ($global->organization_name) {
            $blocks[] = array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => $global->organization_name,
                'url' => $global->organization_url,
                'logo' => $global->organization_logo_url ?? $global->site_logo_url,
            ]);
        }

        $blocks[] = array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            'name' => $global->site_name,
            'url' => $global->organization_url ?? $global->canonical_base,
            'description' => $global->default_description,
        ]);

        if ($page?->structured_data) {
            $blocks[] = $page->structured_data;
        } elseif (str_starts_with($routeKey, 'grammar.tense.') && $title && $canonical) {
            $blocks[] = array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'LearningResource',
                'name' => $title,
                'description' => $description,
                'url' => $canonical,
                'learningResourceType' => 'grammar lesson',
                'inLanguage' => ['vi', 'en'],
            ]);
        } elseif ($title && $description && $canonical) {
            $blocks[] = array_filter([
                '@context' => 'https://schema.org',
                '@type' => 'WebPage',
                'name' => $title,
                'description' => $description,
                'url' => $canonical,
            ]);
        }

        return $blocks;
    }
}

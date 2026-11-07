<?php

namespace App\Services;

use App\Models\Tense;
use App\Models\TenseGroup;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\File;

class GrammarContentExporter
{
    public function grammarFilePath(): string
    {
        $root = dirname(base_path(), 2);

        return $root.DIRECTORY_SEPARATOR.'packages'
            .DIRECTORY_SEPARATOR.'content'
            .DIRECTORY_SEPARATOR.'grammar.json';
    }

    /**
     * @return array{synced: bool, path: string, groups: int, tenses: int, message?: string}
     */
    public function exportToFile(): array
    {
        $path = $this->grammarFilePath();
        $dir = dirname($path);

        if (! File::isDirectory($dir)) {
            return [
                'synced' => false,
                'path' => $path,
                'groups' => 0,
                'tenses' => 0,
                'message' => 'Content directory not found.',
            ];
        }

        $groups = TenseGroup::query()
            ->with('localeEntries')
            ->orderBy('sort_order')
            ->get();

        $tenses = Tense::query()
            ->with(['localeEntries', 'group'])
            ->orderBy('sort_order')
            ->get();

        $payload = [
            'groups' => $groups->map(fn (TenseGroup $g) => $this->exportGroup($g))->values()->all(),
            'tenses' => $tenses->map(fn (Tense $t) => $this->exportTense($t))->values()->all(),
        ];

        $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        if ($json === false) {
            return [
                'synced' => false,
                'path' => $path,
                'groups' => $groups->count(),
                'tenses' => $tenses->count(),
                'message' => 'Failed to encode grammar JSON.',
            ];
        }

        File::put($path, $json.PHP_EOL);

        return [
            'synced' => true,
            'path' => $path,
            'groups' => $groups->count(),
            'tenses' => $tenses->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function exportGroup(TenseGroup $group): array
    {
        return [
            'slug' => $group->slug,
            'name_vi' => (string) ($group->localized('name', '', 'vi') ?? ''),
            'name_en' => (string) ($group->localized('name', '', 'en') ?? ''),
            'sort_order' => (int) $group->sort_order,
            'translations' => $this->translationBag($group, ['name']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function exportTense(Tense $tense): array
    {
        $usageVi = $tense->localized('usage', [], 'vi');
        if (! is_array($usageVi)) {
            $usageVi = $this->linesToUsageArray($usageVi);
        }

        return [
            'slug' => $tense->slug,
            'name_en' => (string) ($tense->localized('name', '', 'en') ?? ''),
            'name_vi' => (string) ($tense->localized('name', '', 'vi') ?? ''),
            'group_slug' => $tense->group?->slug ?? '',
            'sort_order' => (int) $tense->sort_order,
            'structure' => (string) ($tense->structure ?? ''),
            'usage_vi' => array_values($usageVi),
            'signals' => is_array($tense->signals) ? $tense->signals : [],
            'pitfalls_vi' => $tense->localized('pitfalls', null, 'vi'),
            'examples' => is_array($tense->examples) ? $tense->examples : [],
            'translations' => $this->translationBag($tense, ['name', 'usage', 'pitfalls']),
        ];
    }

    /**
     * @param  list<string>  $fields
     * @return array<string, array<string, mixed>>
     */
    private function translationBag(Model $model, array $fields): array
    {
        $out = [];
        foreach ($model->localeEntries as $row) {
            $attrs = $row->getAttribute('attributes');
            if (! is_array($attrs)) {
                continue;
            }
            $bucket = [];
            foreach ($fields as $field) {
                if (! array_key_exists($field, $attrs)) {
                    continue;
                }
                $value = $attrs[$field];
                if ($field === 'usage' && is_string($value)) {
                    $value = $this->linesToUsageArray($value);
                }
                $bucket[$field] = $value;
            }
            if ($bucket !== []) {
                $out[(string) $row->locale] = $bucket;
            }
        }

        return $out;
    }

    /**
     * @return list<string>
     */
    private function linesToUsageArray(mixed $value): array
    {
        if (is_array($value)) {
            return array_values(array_filter(array_map('strval', $value), fn ($l) => $l !== ''));
        }
        if (! is_string($value) || trim($value) === '') {
            return [];
        }

        return array_values(array_filter(array_map('trim', preg_split('/\r\n|\r|\n/', $value) ?: [])));
    }
}

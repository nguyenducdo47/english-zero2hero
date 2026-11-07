<?php

namespace App\Http\Resources;

use App\Models\Tense;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Tense */
class TenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->resource->localized('name'),
            'sort_order' => $this->sort_order,
            'structure' => $this->structure,
            'usage' => $this->resource->localized('usage'),
            'signals' => $this->signals,
            'pitfalls' => $this->resource->localized('pitfalls'),
            'examples' => $this->examples,
            'group' => $this->whenLoaded('group', fn () => [
                'slug' => $this->group->slug,
                'name' => $this->group?->localized('name'),
            ]),
            'translations' => $this->when(
                $request->boolean('include_all_translations'),
                fn () => $this->resource->localeEntries->mapWithKeys(
                    fn ($t) => [$t->locale => $t->attributes]
                )
            ),
        ];
    }
}

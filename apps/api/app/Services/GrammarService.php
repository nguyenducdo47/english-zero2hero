<?php

namespace App\Services;

use App\Http\Resources\TenseResource;
use App\Models\Question;
use App\Models\TenseGroup;
use App\Repositories\QuestionRepository;
use App\Repositories\TenseGroupRepository;
use App\Repositories\TenseRepository;

class GrammarService extends BaseService
{
    public function __construct(
        private TenseGroupRepository $tenseGroups,
        private TenseRepository $tenses,
        private QuestionRepository $questions,
    ) {}

    public function listGroups(): array
    {
        $groups = $this->tenseGroups->allOrderedWithTenses()
            ->map(fn (TenseGroup $g) => [
                'slug' => $g->slug,
                'name' => $g->localized('name'),
                'sort_order' => $g->sort_order,
                'tenses' => TenseResource::collection($g->tenses),
            ]);

        return $this->envelope($groups);
    }

    public function listTenses(): array
    {
        $tenses = $this->tenses->allOrderedWithGroup();

        return $this->envelope(TenseResource::collection($tenses));
    }

    public function showTense(string $slug): array
    {
        $tense = $this->tenses->findBySlugWithGroup($slug);

        return $this->envelope(new TenseResource($tense));
    }

    public function quizForGroup(string $groupSlug, int $limit): array
    {
        $limit = min(20, max(5, $limit));
        $group = $this->tenseGroups->findBySlugWithTranslations($groupSlug);

        $locale = app()->getLocale();
        $questions = $this->questions
            ->randomGrammarQuizForGroup($group, $limit)
            ->map(function (Question $q) use ($locale) {
                $promptEn = $q->localized('prompt', null, 'en')
                    ?? $q->localized('prompt', null, config('app.fallback_locale'));
                $item = [
                    'id' => $q->id,
                    'type' => $q->type,
                    'prompt_en' => $promptEn,
                    'options' => $q->type === 'multiple_choice' ? ($q->payload['options'] ?? []) : null,
                ];
                if ($locale !== 'en') {
                    $translated = $q->localized('prompt', null, $locale);
                    if ($translated && $translated !== $promptEn) {
                        $item['prompt_locale'] = $translated;
                    }
                }

                return $item;
            });

        return $this->envelope([
            'group' => [
                'slug' => $group->slug,
                'name' => $group->localized('name'),
            ],
            'questions' => $questions,
        ]);
    }
}

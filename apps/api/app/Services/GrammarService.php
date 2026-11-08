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

    public function quizForGroup(string $groupSlug, int $requestedLimit): array
    {
        $min = (int) config('grammar.group_quiz.min_limit', 1);
        $max = (int) config('grammar.group_quiz.max_limit', 30);
        $requestedLimit = max($min, min($max, $requestedLimit));

        $group = $this->tenseGroups->findBySlugWithTranslations($groupSlug);
        $poolTotal = $this->questions->countGrammarForGroup($group);
        $limit = min($requestedLimit, $poolTotal);

        $locale = app()->getLocale();
        $questions = $this->questions
            ->randomGrammarQuizForGroup($group, max(0, $limit))
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

        return [
            'data' => [
                'group' => [
                    'slug' => $group->slug,
                    'name' => $group->localized('name'),
                ],
                'questions' => $questions,
            ],
            'meta' => array_merge($this->apiMeta(), [
                'pool_total' => $poolTotal,
                'served_count' => $questions->count(),
                'requested_limit' => $requestedLimit,
            ]),
        ];
    }

    public function quizForTense(string $tenseSlug, int $requestedLimit): array
    {
        $min = (int) config('grammar.group_quiz.min_limit', 1);
        $max = (int) config('grammar.group_quiz.max_limit', 30);
        $requestedLimit = max($min, min($max, $requestedLimit));

        $tense = $this->tenses->findBySlugWithGroup($tenseSlug);
        $poolTotal = $this->questions->countGrammarForTense($tense);
        $limit = min($requestedLimit, $poolTotal);

        $locale = app()->getLocale();
        $questions = $this->questions
            ->randomGrammarQuizForTense($tense, max(0, $limit))
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

        $group = $tense->group;

        return [
            'data' => [
                'tense' => [
                    'slug' => $tense->slug,
                    'name' => $tense->localized('name'),
                ],
                'group' => $group ? [
                    'slug' => $group->slug,
                    'name' => $group->localized('name'),
                ] : null,
                'questions' => $questions,
            ],
            'meta' => array_merge($this->apiMeta(), [
                'pool_total' => $poolTotal,
                'served_count' => $questions->count(),
                'requested_limit' => $requestedLimit,
            ]),
        ];
    }
}

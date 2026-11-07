<?php

namespace App\Services;

use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use App\Repositories\ExamRepository;
use App\Repositories\QuestionRepository;
use App\Repositories\TenseGroupRepository;
use App\Repositories\TenseRepository;

class ContentCatalogService
{
    public function __construct(
        private readonly TenseGroupRepository $tenseGroups,
        private readonly TenseRepository $tenses,
        private readonly QuestionRepository $questions,
        private readonly ExamRepository $exams,
    ) {}

    /**
     * @return array{data: list<array<string, string>>}
     */
    public function tenseGroups(): array
    {
        $items = $this->tenseGroups->allOrderedForCatalog()
            ->map(fn (TenseGroup $g) => [
                'slug' => $g->slug,
                'label' => $g->localized('name', $g->slug),
            ]);

        return ['data' => $items->all()];
    }

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function tenses(?string $groupSlug): array
    {
        $groupId = null;
        if ($groupSlug !== null && $groupSlug !== '') {
            $group = $this->tenseGroups->findBySlugOrFail($groupSlug);
            $groupId = $group->id;
        }

        $items = $this->tenses->forCatalog($groupId)
            ->map(fn (Tense $t) => [
                'slug' => $t->slug,
                'group_slug' => $t->group?->slug,
                'label' => $t->localized('name', $t->slug),
            ]);

        return ['data' => $items->all()];
    }

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function questions(?string $tenseGroupSlug, ?string $examSlug): array
    {
        $tenseGroupId = null;
        $examId = null;

        if ($tenseGroupSlug !== null && $tenseGroupSlug !== '') {
            $group = $this->tenseGroups->findBySlugOrFail($tenseGroupSlug);
            $tenseGroupId = $group->id;
        }

        if ($examSlug !== null && $examSlug !== '') {
            $exam = $this->exams->findBySlugOrFail($examSlug);
            $examId = $exam->id;
        }

        $items = $this->questions->forCatalog($tenseGroupId, $examId)
            ->map(function (Question $q) {
                $prompt = $q->localized('prompt');
                if (! is_string($prompt) || $prompt === '') {
                    $payload = $q->payload;
                    $prompt = is_array($payload) ? json_encode($payload, JSON_UNESCAPED_UNICODE) : (string) $q->type;
                }

                return [
                    'id' => $q->id,
                    'type' => $q->type,
                    'exam_slug' => $q->exam?->slug,
                    'label' => mb_strlen($prompt) > 80 ? mb_substr($prompt, 0, 77).'…' : $prompt,
                ];
            });

        return ['data' => $items->all()];
    }
}

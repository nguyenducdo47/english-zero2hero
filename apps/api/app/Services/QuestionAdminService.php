<?php

namespace App\Services;

use App\Models\Question;
use App\Repositories\QuestionRepository;
use App\Services\Concerns\SyncsModelTranslations;

class QuestionAdminService
{
    use SyncsModelTranslations;

    public function __construct(
        private readonly QuestionRepository $questions,
    ) {}

    /**
     * @return array{data: list<array<string, mixed>>, meta: array<string, int>}
     */
    public function index(int $perPage, ?int $tenseGroupId, ?int $examId, ?string $scope): array
    {
        $paginator = $this->questions->paginateForAdmin($perPage, $tenseGroupId, $examId, $scope);

        return [
            'data' => collect($paginator->items())->map(fn (Question $q) => $this->serialize($q))->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
            ],
        ];
    }

    public function store(array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        $question = $this->questions->create($validated);
        $this->syncTranslations($question, $translations);

        return ['data' => $this->serialize($question->fresh()->load(['exam', 'tenseGroup']))];
    }

    public function update(Question $question, array $validated): array
    {
        $translations = $validated['translations'] ?? null;
        unset($validated['translations']);

        $this->questions->update($question, $validated);
        $this->syncTranslations($question, $translations);

        return ['data' => $this->serialize($question->fresh()->load(['exam', 'tenseGroup']))];
    }

    /**
     * @return array{data: array{deleted: bool}}
     */
    public function destroy(Question $question): array
    {
        $this->questions->delete($question);

        return ['data' => ['deleted' => true]];
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Question $question): array
    {
        $prompt = $question->localized('prompt');
        if (! is_string($prompt) || $prompt === '') {
            $prompt = is_array($question->payload)
                ? json_encode($question->payload, JSON_UNESCAPED_UNICODE)
                : $question->type;
        }

        return [
            'id' => $question->id,
            'tense_group_id' => $question->tense_group_id,
            'tense_group_slug' => $question->tenseGroup?->slug,
            'exam_id' => $question->exam_id,
            'exam_slug' => $question->exam?->slug,
            'type' => $question->type,
            'payload' => $question->payload ?? [],
            'sort_order' => $question->sort_order,
            'translations' => $this->translationsPayload($question),
            'label' => mb_strlen($prompt) > 120 ? mb_substr($prompt, 0, 117).'…' : $prompt,
        ];
    }
}

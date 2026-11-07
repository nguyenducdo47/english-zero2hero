<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\Question;
use App\Repositories\ExamRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExamCatalogService extends BaseService
{
    public function __construct(
        private readonly ExamRepository $exams,
    ) {}

    public function listPublished(?string $examType, ?string $skillMode): LengthAwarePaginator
    {
        return $this->exams->paginatePublished($examType, $skillMode);
    }

    /**
     * @return array<string, mixed>
     */
    public function showPublished(string $slug): array
    {
        $exam = $this->exams->findPublishedBySlugWithContent($slug);
        $locale = app()->getLocale();

        $exam->setRelation('questions', $exam->questions->map(
            fn (Question $q) => $this->mapQuestionForExam($q, $locale),
        ));

        return ['data' => $exam];
    }

    /**
     * @return array<string, mixed>
     */
    private function mapQuestionForExam(Question $q, string $locale): array
    {
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
    }
}

<?php

namespace App\Services;

use App\Models\Exam;
use App\Models\ExamSection;
use App\Repositories\ExamRepository;

class ExamAdminService
{
    public function __construct(
        private readonly ExamRepository $exams,
    ) {}

    /**
     * @return array{data: list<array<string, mixed>>}
     */
    public function index(): array
    {
        $rows = $this->exams->allForAdminIndex()
            ->map(fn (Exam $exam) => $this->serialize($exam, withSections: false));

        return ['data' => $rows->all()];
    }

    /**
     * @return array{data: array<string, mixed>}
     */
    public function show(Exam $exam): array
    {
        $exam = $this->exams->findForAdmin($exam);

        return ['data' => $this->serialize($exam, withSections: true)];
    }

    public function store(array $validated): array
    {
        $sections = $validated['sections'] ?? null;
        unset($validated['sections']);

        $exam = $this->exams->create($validated);
        $this->exams->syncSections($exam, $sections);

        return ['data' => $this->serialize($exam->fresh()->loadCount('questions')->load('sections'), withSections: true)];
    }

    public function update(Exam $exam, array $validated): array
    {
        $sections = $validated['sections'] ?? null;
        unset($validated['sections']);

        $this->exams->update($exam, $validated);
        if ($sections !== null) {
            $this->exams->syncSections($exam, $sections);
        }

        return ['data' => $this->serialize($exam->fresh()->loadCount('questions')->load('sections'), withSections: true)];
    }

    /**
     * @return array{data: array{deleted: bool}}
     */
    public function destroy(Exam $exam): array
    {
        $this->exams->delete($exam);

        return ['data' => ['deleted' => true]];
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Exam $exam, bool $withSections): array
    {
        $payload = [
            'id' => $exam->id,
            'slug' => $exam->slug,
            'title' => $exam->title,
            'exam_type' => $exam->exam_type,
            'skill_mode' => $exam->skill_mode,
            'target_score_min' => $exam->target_score_min,
            'target_score_max' => $exam->target_score_max,
            'target_band_min' => $exam->target_band_min,
            'target_band_max' => $exam->target_band_max,
            'duration_minutes' => $exam->duration_minutes,
            'metadata' => $exam->metadata,
            'is_published' => (bool) $exam->is_published,
            'questions_count' => $exam->questions_count ?? $exam->questions()->count(),
        ];

        if ($withSections) {
            $payload['sections'] = $exam->relationLoaded('sections')
                ? $exam->sections->map(fn (ExamSection $s) => [
                    'id' => $s->id,
                    'skill' => $s->skill,
                    'title' => $s->title,
                    'sort_order' => $s->sort_order,
                    'time_limit_minutes' => $s->time_limit_minutes,
                ])->values()
                : [];
        }

        return $payload;
    }
}

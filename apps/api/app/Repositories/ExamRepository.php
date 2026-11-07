<?php

namespace App\Repositories;

use App\Models\Exam;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ExamRepository extends BaseRepository
{
    public function __construct(Exam $model)
    {
        parent::__construct($model);
    }

    public function paginatePublished(?string $examType, ?string $skillMode, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->query()->where('is_published', true);

        if ($examType !== null && $examType !== '') {
            $query->where('exam_type', $examType);
        }
        if ($skillMode !== null && $skillMode !== '') {
            $query->where('skill_mode', $skillMode);
        }

        return $query->orderBy('id')->paginate($perPage);
    }

    public function findPublishedBySlugWithContent(string $slug): Exam
    {
        /** @var Exam */
        return $this->query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->with([
                'sections',
                'questions' => fn ($q) => $q->with('localeEntries')->orderBy('sort_order'),
            ])
            ->firstOrFail();
    }

    public function findPublishedBySlug(string $slug): Exam
    {
        /** @var Exam */
        return $this->query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Exam>
     */
    public function allForAdminIndex()
    {
        return $this->query()->withCount('questions')->orderBy('title')->get();
    }

    public function findForAdmin(Exam $exam): Exam
    {
        return $exam->load([
            'sections' => fn ($q) => $q->orderBy('sort_order'),
        ])->loadCount('questions');
    }

    public function findBySlugOrFail(string $slug): Exam
    {
        /** @var Exam */
        return $this->query()->where('slug', $slug)->firstOrFail();
    }

    public function syncSections(Exam $exam, ?array $sections): void
    {
        if ($sections === null) {
            return;
        }

        $exam->sections()->delete();
        foreach ($sections as $index => $section) {
            $exam->sections()->create([
                'skill' => $section['skill'],
                'title' => $section['title'],
                'sort_order' => $section['sort_order'] ?? $index + 1,
                'time_limit_minutes' => $section['time_limit_minutes'] ?? null,
            ]);
        }
    }
}

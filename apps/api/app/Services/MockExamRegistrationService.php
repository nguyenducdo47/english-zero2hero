<?php

namespace App\Services;

use App\Repositories\ExamRepository;
use App\Repositories\MockExamRegistrationRepository;

class MockExamRegistrationService
{
    public function __construct(
        private readonly MockExamRegistrationRepository $registrations,
        private readonly ExamRepository $exams,
    ) {}

    public function store(array $validated, int $userId): \App\Models\MockExamRegistration
    {
        $exam = $this->exams->findBySlugOrFail($validated['exam_slug']);

        return $this->registrations->create([
            'user_id' => $userId,
            'exam_id' => $exam->id,
            'scheduled_at' => $validated['scheduled_at'],
            'status' => 'registered',
        ])->load('exam');
    }

    public function indexForUser(int $userId): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->registrations->paginateForUser($userId);
    }
}

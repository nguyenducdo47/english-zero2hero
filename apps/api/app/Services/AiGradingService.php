<?php

namespace App\Services;

use App\Models\AiReview;
use App\Models\Attempt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AiGradingService
{
    public function reviewWriting(Attempt $attempt, string $prompt, string $userText, string $skill = 'writing'): AiReview
    {
        $rubric = $this->buildRubric($prompt, $userText, $skill);

        return AiReview::query()->create([
            'attempt_id' => $attempt->id,
            'skill' => $skill,
            'rubric_json' => $rubric,
            'model_version' => config('services.ai.provider', 'stub').'/'.config('services.ai.model', '1.0'),
        ]);
    }

    public function reviewSpeaking(Attempt $attempt, string $transcript, ?string $referenceText = null): AiReview
    {
        $rubric = [
            'task_response' => ['score' => 6.0, 'feedback_vi' => 'Nội dung đáp ứng đủ ý cơ bản.'],
            'fluency' => ['score' => 5.5, 'feedback_vi' => 'Duy trì lưu loát ở mức trung bình.'],
            'pronunciation' => ['score' => 6.0, 'feedback_vi' => 'Phát âm cần luyện trọng âm và nối âm.'],
            'grammar' => ['score' => 5.5, 'feedback_vi' => $this->grammarHints($transcript)],
            'transcript' => $transcript,
            'reference' => $referenceText,
            'overall_band_estimate' => 6.0,
        ];

        return AiReview::query()->create([
            'attempt_id' => $attempt->id,
            'skill' => 'speaking',
            'rubric_json' => $rubric,
            'model_version' => config('services.ai.provider', 'stub').'/stt',
        ]);
    }

    private function buildRubric(string $prompt, string $userText, string $skill): array
    {
        $provider = config('services.ai.provider', 'stub');

        if ($provider === 'openai' && config('services.ai.key')) {
            return $this->callOpenAi($prompt, $userText, $skill);
        }

        return $this->stubRubric($prompt, $userText);
    }

    private function callOpenAi(string $prompt, string $userText, string $skill): array
    {
        $response = Http::withToken(config('services.ai.key'))
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.ai.model', 'gpt-4o-mini'),
                'temperature' => 0.2,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an English examiner. Return JSON only with keys: task_response, coherence, grammar, vocabulary (each: score 0-9, feedback_vi string), overall_band_estimate, model_answer_en.',
                    ],
                    [
                        'role' => 'user',
                        'content' => "Skill: {$skill}\nPrompt: {$prompt}\nStudent answer:\n{$userText}",
                    ],
                ],
                'response_format' => ['type' => 'json_object'],
            ]);

        if ($response->successful()) {
            $content = $response->json('choices.0.message.content');
            $decoded = json_decode($content, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return $this->stubRubric($prompt, $userText);
    }

    private function stubRubric(string $prompt, string $userText): array
    {
        $wordCount = str_word_count($userText);

        return [
            'task_response' => [
                'score' => min(9, max(4, $wordCount > 40 ? 6.5 : 5.0)),
                'feedback_vi' => 'Bài viết '.($wordCount > 40 ? 'đủ độ dài cơ bản' : 'hơi ngắn, cần mở rộng ý').'.',
            ],
            'coherence' => [
                'score' => 6.0,
                'feedback_vi' => 'Thêm từ nối (however, therefore, firstly) để mạch lạc hơn.',
            ],
            'grammar' => [
                'score' => 5.5,
                'feedback_vi' => $this->grammarHints($userText),
            ],
            'vocabulary' => [
                'score' => 6.0,
                'feedback_vi' => 'Dùng thêm collocations để tăng điểm từ vựng.',
            ],
            'overall_band_estimate' => 6.0,
            'model_answer_en' => 'Sample: '.Str::limit($prompt, 120).' ...',
            'prompt' => $prompt,
        ];
    }

    private function grammarHints(string $text): string
    {
        $issues = [];
        if (! preg_match('/\b(is|are|am|was|were|have|has|do|does|did|will)\b/i', $text)) {
            $issues[] = 'Thiếu động từ chia thì rõ ràng.';
        }
        if (preg_match('/\b(he|she|it)\s+\w+(?<!s)\b/i', $text)) {
            $issues[] = 'Kiểm tra chia động từ ngôi thứ 3 số ít.';
        }

        return $issues ? implode(' ', $issues) : 'Ngữ pháp ổn ở mức cơ bản.';
    }
}

<?php

namespace App\Services;

use App\Models\Question;

class QuizGrader
{
    public function grade(Question $question, mixed $userAnswer): array
    {
        $payload = $question->payload;
        $type = $question->type;

        if ($type === 'multiple_choice') {
            $selected = is_array($userAnswer) ? ($userAnswer['index'] ?? null) : $userAnswer;
            $correctIndex = $payload['correct_index'] ?? null;
            $isCorrect = (int) $selected === (int) $correctIndex;
            $correct = [
                'index' => $correctIndex,
                'text' => $payload['options'][$correctIndex] ?? null,
            ];

            return [
                'is_correct' => $isCorrect,
                'correct_answer' => $correct,
                'explanation_vi' => $question->explanation_vi,
            ];
        }

        if ($type === 'fill_blank') {
            $text = $this->normalize(is_array($userAnswer) ? ($userAnswer['text'] ?? '') : (string) $userAnswer);
            $accepted = array_map(fn ($a) => $this->normalize($a), $payload['correct_answers'] ?? []);
            $synonyms = array_map(fn ($a) => $this->normalize($a), $payload['synonyms'] ?? []);
            $all = array_unique(array_merge($accepted, $synonyms));
            $isCorrect = in_array($text, $all, true);

            return [
                'is_correct' => $isCorrect,
                'correct_answer' => ['text' => $payload['correct_answers'][0] ?? null],
                'explanation_vi' => $question->explanation_vi,
            ];
        }

        return [
            'is_correct' => false,
            'correct_answer' => null,
            'explanation_vi' => $question->explanation_vi,
        ];
    }

    private function normalize(string $value): string
    {
        return strtolower(trim(preg_replace('/\s+/', ' ', $value)));
    }
}

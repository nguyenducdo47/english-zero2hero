<?php

namespace App\Services;

class GrammarAnalysisHeuristic
{
    /** @var array<int, array{slug: string, pattern: string, structure: string, note: string}> */
    private const TENSE_RULES = [
        ['slug' => 'present-perfect-continuous', 'pattern' => '/\b(have|has)\s+been\s+\w+ing\b/i', 'structure' => 'S + have/has + been + V-ing', 'note' => 'Dấu hiệu have/has been + V-ing — thì hiện tại hoàn thành tiếp diễn.'],
        ['slug' => 'present-perfect', 'pattern' => '/\b(have|has)\s+\w+(ed|en)\b/i', 'structure' => 'S + have/has + V3', 'note' => 'Have/has + động từ quá khứ phân từ — hiện tại hoàn thành.'],
        ['slug' => 'present-continuous', 'pattern' => '/\b(am|is|are)\s+\w+ing\b/i', 'structure' => 'S + am/is/are + V-ing', 'note' => 'Am/is/are + V-ing — hiện tại tiếp diễn.'],
        ['slug' => 'past-continuous', 'pattern' => '/\b(was|were)\s+\w+ing\b/i', 'structure' => 'S + was/were + V-ing', 'note' => 'Was/were + V-ing — quá khứ tiếp diễn.'],
        ['slug' => 'past-perfect', 'pattern' => '/\bhad\s+\w+(ed|en)\b/i', 'structure' => 'S + had + V3', 'note' => 'Had + V3 — quá khứ hoàn thành.'],
        ['slug' => 'future-simple', 'pattern' => '/\bwill\s+\w+\b/i', 'structure' => 'S + will + V', 'note' => 'Will + động từ nguyên mẫu — tương lai đơn.'],
        ['slug' => 'future-continuous', 'pattern' => '/\bwill\s+be\s+\w+ing\b/i', 'structure' => 'S + will + be + V-ing', 'note' => 'Will be + V-ing — tương lai tiếp diễn.'],
        ['slug' => 'past-simple', 'pattern' => '/\b(did|was|were)\b|\w+ed\b/i', 'structure' => 'S + V2 / did + V', 'note' => 'Dấu hiệu quá khứ: V-ed, did, was/were.'],
        ['slug' => 'present-simple', 'pattern' => '/\b(do|does|don\'t|doesn\'t)\b|\b(he|she|it)\s+\w+s\b/i', 'structure' => 'S + V(s/es)', 'note' => 'Thói quen / sự thật — chia động từ (s/es với he/she/it).'],
    ];

    public function detectLang(string $text): string
    {
        if (preg_match('/[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/iu', $text)) {
            return 'vi';
        }

        return 'en';
    }

    /**
     * @return list<string>
     */
    public function splitSentences(string $text): array
    {
        $chunks = preg_split('/(?<=[.!?])\s+/u', trim($text), -1, PREG_SPLIT_NO_EMPTY);

        return $chunks ?: [trim($text)];
    }

    /**
     * @return array{tense_slugs: list<string>, structure: string, grammar_notes_vi: list<string>}
     */
    public function analyzeEnglishSentence(string $sentence): array
    {
        $slugs = [];
        $notes = [];
        $structure = '—';

        foreach (self::TENSE_RULES as $rule) {
            if (preg_match($rule['pattern'], $sentence)) {
                if (! in_array($rule['slug'], $slugs, true)) {
                    $slugs[] = $rule['slug'];
                    $notes[] = $rule['note'];
                    $structure = $rule['structure'];
                }
            }
        }

        if ($slugs === []) {
            $notes[] = $this->genericGrammarHints($sentence);
            $structure = 'S + V + …';
        }

        if (preg_match('/\b(he|she|it)\s+(\w+)(?<!s)\b/i', $sentence, $m) && ! preg_match('/\b(is|was|has|does)\b/i', $m[0])) {
            $notes[] = 'Kiểm tra chia động từ số ít ngôi thứ 3 (he/she/it).';
        }

        return [
            'tense_slugs' => array_slice($slugs, 0, 2),
            'structure' => $structure,
            'grammar_notes_vi' => array_values(array_unique($notes)),
        ];
    }

    private function genericGrammarHints(string $text): string
    {
        if (! preg_match('/\b(is|are|am|was|were|have|has|do|does|did|will)\b/i', $text)) {
            return 'Câu có thể thiếu động từ hỗ trợ hoặc chia thì — xem lại cấu trúc S + V.';
        }

        return 'Bật AI sau này để phân tích sâu hơn; hiện chỉ gợi ý heuristic.';
    }
}

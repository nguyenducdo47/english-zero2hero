<?php

namespace App\Services\GrammarQuestion;

use Symfony\Component\DomCrawler\Crawler;

class HtmlJsonLdQuizAdapter implements GrammarQuestionFeedAdapterInterface
{
    public function key(): string
    {
        return 'html_json_ld';
    }

    /**
     * @return array{questions: list<array<string, mixed>>, errors: list<string>}
     */
    public function fetch(string $url): array
    {
        $whitelist = GrammarQuestionHttpClient::assertWhitelisted($url);
        if ($whitelist !== null) {
            return ['questions' => [], 'errors' => [$whitelist]];
        }

        $response = GrammarQuestionHttpClient::getBody($url);
        if (! $response['ok']) {
            return ['questions' => [], 'errors' => [(string) $response['error']]];
        }

        $crawler = new Crawler($response['body']);
        $questions = [];
        $errors = [];

        $crawler->filter('script[type="application/ld+json"]')->each(function (Crawler $node) use (&$questions, &$errors) {
            $raw = trim($node->text());
            if ($raw === '') {
                return;
            }

            $decoded = json_decode($raw, true);
            if (! is_array($decoded)) {
                $errors[] = 'JSON-LD block: invalid JSON';

                return;
            }

            $this->collectFromLdNode($decoded, $questions);
        });

        if ($questions === [] && $errors === []) {
            $errors[] = 'No application/ld+json quiz payload found on page';
        }

        return ['questions' => $questions, 'errors' => $errors];
    }

    /**
     * @param  array<string, mixed>|list<mixed>  $node
     * @param  list<array<string, mixed>>  $out
     */
    private function collectFromLdNode(array $node, array &$out): void
    {
        if (isset($node['questions']) && is_array($node['questions'])) {
            foreach ($node['questions'] as $item) {
                if (is_array($item) && $this->isNormalizedItem($item)) {
                    $out[] = $item;
                }
            }
        }

        if (isset($node['@graph']) && is_array($node['@graph'])) {
            foreach ($node['@graph'] as $child) {
                if (is_array($child)) {
                    $this->collectFromLdNode($child, $out);
                }
            }
        }

        $type = $node['@type'] ?? null;
        if ($type === 'Quiz' || $type === 'Question') {
            $mapped = $this->mapSchemaQuestion($node);
            if ($mapped !== null) {
                $out[] = $mapped;
            }
        }
    }

    /**
     * @param  array<string, mixed>  $item
     */
    private function isNormalizedItem(array $item): bool
    {
        return isset($item['prompt_en'], $item['type'], $item['tense_group_slug']);
    }

    /**
     * @param  array<string, mixed>  $node
     * @return array<string, mixed>|null
     */
    private function mapSchemaQuestion(array $node): ?array
    {
        $text = trim((string) ($node['text'] ?? $node['name'] ?? ''));
        if ($text === '') {
            return null;
        }

        $answers = [];
        if (isset($node['suggestedAnswer']) && is_array($node['suggestedAnswer'])) {
            foreach ($node['suggestedAnswer'] as $ans) {
                if (is_array($ans) && isset($ans['text'])) {
                    $answers[] = (string) $ans['text'];
                }
            }
        }

        if ($answers === []) {
            return null;
        }

        $correct = 0;
        if (isset($node['acceptedAnswer'])) {
            $accepted = is_array($node['acceptedAnswer'])
                ? ($node['acceptedAnswer']['text'] ?? '')
                : $node['acceptedAnswer'];
            $idx = array_search($accepted, $answers, true);
            if ($idx !== false) {
                $correct = (int) $idx;
            }
        }

        return [
            'type' => 'multiple_choice',
            'prompt_en' => $text,
            'options' => $answers,
            'correct_index' => $correct,
            'explanation_vi' => (string) ($node['description'] ?? ''),
        ];
    }
}

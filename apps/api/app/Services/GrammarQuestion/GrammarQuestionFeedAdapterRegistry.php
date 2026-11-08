<?php

namespace App\Services\GrammarQuestion;

use InvalidArgumentException;

class GrammarQuestionFeedAdapterRegistry
{
    /** @var array<string, GrammarQuestionFeedAdapterInterface> */
    private array $adapters = [];

    public function __construct(
        JsonFeedAdapter $jsonFeed,
        HtmlJsonLdQuizAdapter $htmlJsonLd,
    ) {
        foreach ([$jsonFeed, $htmlJsonLd] as $adapter) {
            $this->adapters[$adapter->key()] = $adapter;
        }

        foreach (config('grammar.feed_adapters', []) as $key => $class) {
            if (! is_string($class) || $class === '' || isset($this->adapters[$key])) {
                continue;
            }
            $instance = app($class);
            if ($instance instanceof GrammarQuestionFeedAdapterInterface) {
                $this->adapters[$key] = $instance;
            }
        }
    }

    /**
     * @return list<string>
     */
    public function keys(): array
    {
        return array_keys($this->adapters);
    }

    public function resolve(string $key): GrammarQuestionFeedAdapterInterface
    {
        if (! isset($this->adapters[$key])) {
            throw new InvalidArgumentException("Unknown feed adapter: {$key}");
        }

        return $this->adapters[$key];
    }
}

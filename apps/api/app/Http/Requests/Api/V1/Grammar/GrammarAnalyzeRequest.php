<?php

namespace App\Http\Requests\Api\V1\Grammar;

use App\Models\Locale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GrammarAnalyzeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $mode = $this->input('mode', 'sentence');
        $max = (int) (config("grammar_tool.max_chars.{$mode}") ?? config('grammar_tool.max_chars.sentence'));
        $localeCodes = Locale::activeCodes();
        $langChoices = array_merge(['auto'], $localeCodes);

        return [
            'text' => ['required', 'string', 'min:1', 'max:'.$max],
            'source_lang' => ['sometimes', Rule::in($langChoices)],
            'target_lang' => ['sometimes', Rule::in($langChoices)],
            'mode' => ['sometimes', Rule::in(['word', 'sentence', 'paragraph'])],
        ];
    }

    public function text(): string
    {
        return trim(strip_tags((string) $this->input('text')));
    }

    public function sourceLang(): string
    {
        return (string) $this->input('source_lang', 'auto');
    }

    public function targetLang(): string
    {
        return (string) $this->input('target_lang', 'auto');
    }

    public function mode(): string
    {
        return (string) $this->input('mode', 'sentence');
    }
}

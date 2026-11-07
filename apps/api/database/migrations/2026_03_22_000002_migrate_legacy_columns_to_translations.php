<?php

use App\Models\Locale;
use App\Models\Question;
use App\Models\Tense;
use App\Models\TenseGroup;
use App\Models\Translation;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Locale::query()->count() === 0) {
            Locale::query()->insert([
                [
                    'code' => 'vi',
                    'name' => 'Vietnamese',
                    'native_name' => 'Tiếng Việt',
                    'is_default' => true,
                    'is_active' => true,
                    'sort_order' => 1,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'code' => 'en',
                    'name' => 'English',
                    'native_name' => 'English',
                    'is_default' => false,
                    'is_active' => true,
                    'sort_order' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        if (! Schema::hasColumn('tense_groups', 'name_vi')) {
            return;
        }

        foreach (TenseGroup::query()->get() as $group) {
            $this->upsert($group, 'vi', ['name' => $group->getRawOriginal('name_vi') ?? $group->name_vi ?? '']);
            $this->upsert($group, 'en', ['name' => $group->getRawOriginal('name_en') ?? $group->name_en ?? '']);
        }

        foreach (Tense::query()->get() as $tense) {
            $this->upsert($tense, 'vi', [
                'name' => $tense->name_vi,
                'usage' => $tense->usage_vi,
                'pitfalls' => $tense->pitfalls_vi,
            ]);
            $this->upsert($tense, 'en', [
                'name' => $tense->name_en,
                'usage' => $tense->usage_vi,
                'pitfalls' => $tense->pitfalls_vi,
            ]);
        }

        foreach (Question::query()->get() as $question) {
            $promptVi = $question->prompt_vi;
            $promptEn = $question->prompt_en;
            $explVi = $question->explanation_vi;
            $explEn = $question->explanation_en ?? $question->explanation_vi;

            $this->upsert($question, 'vi', [
                'prompt' => $promptVi ?? $promptEn,
                'explanation' => $explVi,
            ]);
            $this->upsert($question, 'en', [
                'prompt' => $promptEn,
                'explanation' => $explEn,
            ]);
        }

        Schema::table('tense_groups', function (Blueprint $table) {
            $table->dropColumn(['name_vi', 'name_en']);
        });

        Schema::table('tenses', function (Blueprint $table) {
            $table->dropColumn(['name_vi', 'name_en', 'usage_vi', 'pitfalls_vi']);
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['prompt_en', 'prompt_vi', 'explanation_vi', 'explanation_en']);
        });
    }

    public function down(): void
    {
        Schema::table('tense_groups', function (Blueprint $table) {
            $table->string('name_vi')->nullable();
            $table->string('name_en')->nullable();
        });

        Schema::table('tenses', function (Blueprint $table) {
            $table->string('name_en')->nullable();
            $table->string('name_vi')->nullable();
            $table->json('usage_vi')->nullable();
            $table->text('pitfalls_vi')->nullable();
        });

        Schema::table('questions', function (Blueprint $table) {
            $table->text('prompt_en')->nullable();
            $table->text('prompt_vi')->nullable();
            $table->text('explanation_vi')->nullable();
            $table->text('explanation_en')->nullable();
        });
    }

    private function upsert($model, string $locale, array $attributes): void
    {
        $attributes = array_filter($attributes, fn ($v) => $v !== null && $v !== '');
        if ($attributes === []) {
            return;
        }

        Translation::query()->updateOrCreate(
            [
                'locale' => $locale,
                'translatable_type' => $model->getMorphClass(),
                'translatable_id' => $model->getKey(),
            ],
            ['attributes' => $attributes]
        );
    }
};

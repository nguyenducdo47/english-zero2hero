<?php

namespace Database\Seeders;

use App\Models\Locale;
use Illuminate\Database\Seeder;

class LocaleSeeder extends Seeder
{
    public function run(): void
    {
        $locales = [
            [
                'code' => 'vi',
                'name' => 'Vietnamese',
                'native_name' => 'Tiếng Việt',
                'is_default' => true,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'en',
                'name' => 'English',
                'native_name' => 'English',
                'is_default' => false,
                'is_active' => true,
                'sort_order' => 2,
            ],
        ];

        foreach ($locales as $row) {
            Locale::query()->updateOrCreate(
                ['code' => $row['code']],
                $row
            );
        }
    }
}

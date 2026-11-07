<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            LocaleSeeder::class,
            AdminUserSeeder::class,
            RoleSeeder::class,
            GrammarContentSeeder::class,
            ExamSeeder::class,
        ]);
    }
}

<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $all = array_keys(config('admin_permissions', []));

        $admin = Role::query()->updateOrCreate(
            ['slug' => 'administrator'],
            [
                'name' => 'Administrator',
                'description' => 'Full access to admin panel and settings.',
                'permissions' => $all,
                'is_system' => true,
            ],
        );

        Role::query()->updateOrCreate(
            ['slug' => 'content-editor'],
            [
                'name' => 'Content editor',
                'description' => 'Locales, translations, SEO — no system settings.',
                'permissions' => [
                    'admin.access',
                    'content.locales',
                    'content.translations',
                    'content.seo',
                    'content.catalog',
                    'content.tense_groups',
                    'content.tenses',
                    'content.questions',
                    'content.exams',
                ],
                'is_system' => true,
            ],
        );

        Role::query()->updateOrCreate(
            ['slug' => 'viewer'],
            [
                'name' => 'Viewer',
                'description' => 'Read-only admin access (catalog, metrics).',
                'permissions' => ['admin.access', 'content.catalog'],
                'is_system' => true,
            ],
        );

        $adminUser = User::query()->where('email', 'admin@english-zero2hero.local')->first();
        if ($adminUser) {
            $adminUser->roles()->syncWithoutDetaching([$admin->id]);
        }
    }
}

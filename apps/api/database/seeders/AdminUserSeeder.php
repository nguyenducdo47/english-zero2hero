<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@english-zero2hero.local');
        $name = env('ADMIN_NAME', 'Site Admin');
        $password = env('ADMIN_PASSWORD', '123123123');

        if ($email === '' || $email === null) {
            return;
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'email_verified_at' => now(),
                'is_admin' => true,
            ]
        );
    }
}

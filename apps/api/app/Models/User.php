<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Laravel\Sanctum\HasApiTokens;

#[Fillable([
    'name',
    'email',
    'password',
    'is_admin',
    'google_id',
    'avatar',
    'exam_track',
    'target_toeic_score',
    'target_ielts_band',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'target_ielts_band' => 'float',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function hasAdminAccess(): bool
    {
        if ($this->is_admin) {
            return true;
        }

        if ($this->relationLoaded('roles')) {
            return $this->roles->contains(
                fn (Role $role) => in_array('admin.access', $role->permissions ?? [], true),
            );
        }

        return $this->roles()
            ->whereJsonContains('permissions', 'admin.access')
            ->exists();
    }
}

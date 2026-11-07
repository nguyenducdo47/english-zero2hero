<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentSource extends Model
{
    protected $fillable = [
        'source_url', 'domain', 'license', 'review_status', 'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }
}

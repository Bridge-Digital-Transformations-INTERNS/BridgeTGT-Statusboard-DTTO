<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuthSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'account_type',
        'avatar_url',
        'access_token',
        'session_token',
        'is_authenticated',
        'expires_at',
    ];

    protected $casts = [
        'is_authenticated' => 'boolean',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope to get only active (authenticated and not expired) sessions
     */
    public function scopeActive($query)
    {
        return $query->where('is_authenticated', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }
}

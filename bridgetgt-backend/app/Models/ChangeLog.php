<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChangeLog extends Model
{
    use HasFactory;

    // Disable timestamps as the table doesn't have created_at/updated_at columns
    public $timestamps = false;

    // Use 'timestamp' column instead of default timestamps
    const CREATED_AT = 'timestamp';
    const UPDATED_AT = null;

    protected $fillable = [
        'session_id',
        'action',
        'entity',
        'entity_id',
        'details',
        'timestamp',
    ];

    protected $casts = [
        'details' => 'array',
        'timestamp' => 'datetime',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    // Disable timestamps as the table doesn't have created_at/updated_at columns
    public $timestamps = false;

    protected $fillable = [
        'name',
    ];

    public function developers(): BelongsToMany
    {
        return $this->belongsToMany(Developer::class, 'developer_roles');
    }
}

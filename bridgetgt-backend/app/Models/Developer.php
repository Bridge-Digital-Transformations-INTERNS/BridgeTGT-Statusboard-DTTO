<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Developer extends Model
{
    use HasFactory;

    // Disable timestamps as the table doesn't have created_at/updated_at columns
    public $timestamps = false;

    protected $fillable = [
        'name',
        'color',
        'profile_picture',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'developer_roles');
    }

    public function tasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'task_assignees');
    }
}

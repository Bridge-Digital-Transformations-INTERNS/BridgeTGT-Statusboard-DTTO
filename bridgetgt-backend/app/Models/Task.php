<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Task extends Model
{
    use HasFactory;

    // Disable timestamps as the table doesn't have created_at/updated_at columns
    public $timestamps = false;

    protected $fillable = [
        'project_id',
        'title',
        'phase',
        'weight',
        'status',
        'startDate',
        'targetDate',
        'endDate',
        'color',
    ];

    protected $casts = [
        'startDate' => 'date',
        'targetDate' => 'date',
        'endDate' => 'date',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(Developer::class, 'task_assignees')
            ->select(['developers.id', 'developers.name', 'developers.color', 'developers.profile_picture']);
    }
}

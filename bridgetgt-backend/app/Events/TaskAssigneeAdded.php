<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskAssigneeAdded implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $task_id;
    public $developer_id;
    public $developer;

    public function __construct($task_id, $developer_id, $developer = null)
    {
        $this->task_id = $task_id;
        $this->developer_id = $developer_id;
        $this->developer = $developer;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('tasks'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'taskAssignee.added';
    }

    public function broadcastWith(): array
    {
        return [
            'task_id' => $this->task_id,
            'developer_id' => $this->developer_id,
            'developer' => $this->developer ? [
                'id' => $this->developer->id,
                'name' => $this->developer->name,
                'color' => $this->developer->color,
                'profile_picture' => $this->developer->profile_picture,
            ] : null,
        ];
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeveloperUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $developer;

    public function __construct($developer)
    {
        $this->developer = $developer;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('developers'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'developer.updated';
    }
}

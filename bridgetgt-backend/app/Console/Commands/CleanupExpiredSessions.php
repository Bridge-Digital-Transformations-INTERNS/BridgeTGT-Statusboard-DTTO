<?php

namespace App\Console\Commands;

use App\Models\AuthSession;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupExpiredSessions extends Command
{
    protected $signature = 'sessions:cleanup';
    protected $description = 'Cleanup expired authentication sessions';

    public function handle()
    {
        $count = AuthSession::where('expires_at', '<', Carbon::now())
            ->where('is_authenticated', true)
            ->update(['is_authenticated' => false]);

        $this->info("Cleaned up {$count} expired sessions");
        
        return 0;
    }
}

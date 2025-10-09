<?php

namespace App\Http\Middleware;

use App\Models\ChangeLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogChange
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $action, string $entityType): Response
    {
        // Process the request first
        $response = $next($request);

        // Only log if request was successful
        if ($response->status() >= 200 && $response->status() < 300) {
            $this->logChange($request, $action, $entityType);
        }

        return $response;
    }

    private function logChange(Request $request, string $action, string $entityType): void
    {
        $session = $request->get('auth_session');
        $username = $session ? $session->username : 'system';

        $details = [];
        $entityId = null;

        // Extract entity ID based on action
        if ($action === 'create') {
            $responseData = json_decode($request->response ?? '{}', true);
            $entityId = $responseData['id'] ?? $request->get('createdId');
            $details = $request->all();
        } elseif ($action === 'update') {
            $entityId = $request->route('id');
            $details = $request->all();
        } elseif ($action === 'delete') {
            $entityId = $request->route('id');
            $details = $request->get('deletedDetails', []);
        }

        ChangeLog::create([
            'username' => $username,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'details' => $details
        ]);
    }
}

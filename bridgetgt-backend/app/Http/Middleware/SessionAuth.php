<?php

namespace App\Http\Middleware;

use App\Models\AuthSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SessionAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $sessionToken = $request->header('X-Session-Token') ?? $request->input('session_token');

        if (!$sessionToken) {
            return response()->json(['error' => 'Unauthorized - No session token'], 401);
        }

        $session = AuthSession::where('session_token', $sessionToken)
            ->active()
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Unauthorized - Invalid session'], 401);
        }

        // Attach session info to request
        $request->merge(['auth_session' => $session]);

        return $next($request);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\AuthSession;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    /**
     * Logout - Deactivate session
     */
    public function logout(Request $request)
    {
        $token = $request->header('X-Session-Token') ?? $request->input('session_token');
        
        if (!$token) {
            return response()->json(['error' => 'Session token required'], 400);
        }

        AuthSession::where('session_token', $token)->update(['is_authenticated' => false]);
        
        return response()->json(['success' => true]);
    }

    /**
     * Get all active (online) sessions
     */
    public function getActiveSessions()
    {
        $this->cleanupExpiredSessions();
        
        $sessions = AuthSession::where('is_authenticated', true)
            ->select('username', 'avatar_url')
            ->get();
        
        return response()->json($sessions);
    }

    /**
     * Validate session token
     */
    public function validateSession(Request $request)
    {
        $token = $request->header('X-Session-Token') ?? $request->input('session_token');
        
        if (!$token) {
            return response()->json(['error' => 'Session token required'], 401);
        }

        // Cleanup expired sessions first
        $this->cleanupExpiredSessions();

        $session = AuthSession::where('session_token', $token)
            ->where('is_authenticated', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', Carbon::now());
            })
            ->first();

        if (!$session) {
            // Mark this specific session as unauthenticated if it exists
            AuthSession::where('session_token', $token)->update(['is_authenticated' => false]);
            return response()->json(['error' => 'Invalid or expired session'], 401);
        }

        return response()->json(['valid' => true, 'session' => $session]);
    }

    /**
     * Login with company key (admin)
     */
    public function loginWithCompanyKey(Request $request)
    {
        $request->validate(['key' => 'required|string']);

        if ($request->key !== env('COMPANY_ACCESS_KEY')) {
            return response()->json(['error' => 'Invalid company key'], 401);
        }

        // REMOVED: Session security check to allow multiple logins and prevent auto-logout on refresh
        // Allow multiple sessions for the same user

        // Generate JWT
        $payload = [
            'role' => 'admin',
            'type' => 'company-key',
            'exp' => time() + (12 * 60 * 60) // 12 hours
        ];
        $token = JWT::encode($payload, env('JWT_SECRET'), 'HS256');

        // Generate session token
        $sessionToken = substr(str_shuffle(str_repeat('0123456789abcdefghijklmnopqrstuvwxyz', 20)), 0, 20) . dechex(time());

        // Create session
        AuthSession::create([
            'username' => 'admin',
            'account_type' => 'admin',
            'avatar_url' => '',
            'access_token' => $token,
            'session_token' => $sessionToken,
            'expires_at' => Carbon::now()->addHours(12)
        ]);

        return response()->json(['token' => $token, 'session_token' => $sessionToken]);
    }

    /**
     * Redirect to GitHub OAuth
     */
    public function githubRedirect()
    {
        $redirectUri = env('GITHUB_CALLBACK_URL');
        $clientId = env('GITHUB_CLIENT_ID');
        $githubAuthUrl = "https://github.com/login/oauth/authorize?client_id={$clientId}&redirect_uri=" 
            . urlencode($redirectUri) . "&scope=read:user%20read:org";
        
        return redirect($githubAuthUrl);
    }

    /**
     * GitHub OAuth callback
     */
    public function githubCallback(Request $request)
    {
        $code = $request->query('code');
        
        if (!$code) {
            return response()->json(['error' => 'Missing code'], 400);
        }

        $frontendUrl = env('FRONTEND_URL') . '/auth/callback';
        return redirect("{$frontendUrl}?code={$code}");
    }

    /**
     * Exchange GitHub OAuth code for access token
     */
    public function githubExchange(Request $request)
    {
        $code = $request->query('code');
        
        if (!$code) {
            return response()->json(['error' => 'Missing code'], 400);
        }

        try {
            // Exchange code for access token
            $tokenResponse = Http::acceptJson()->post('https://github.com/login/oauth/access_token', [
                'client_id' => env('GITHUB_CLIENT_ID'),
                'client_secret' => env('GITHUB_CLIENT_SECRET'),
                'code' => $code,
            ]);

            $accessToken = $tokenResponse->json()['access_token'] ?? null;

            if (!$accessToken) {
                return response()->json(['error' => 'Invalid access token'], 401);
            }

            // Fetch user info
            $userResponse = Http::withToken($accessToken)->get('https://api.github.com/user');
            $user = $userResponse->json();

            // Fetch user organizations
            $orgResponse = Http::withToken($accessToken)->get('https://api.github.com/user/orgs');
            $orgs = $orgResponse->json();

            // Check if user is part of the organization
            $orgName = 'Bridge-Digital-Transformations-INTERNS';
            $isDeveloper = collect($orgs)->contains('login', $orgName);

            if (!$isDeveloper) {
                return response()->json(['error' => 'Not a developer of the organization'], 403);
            }

            // REMOVED: Session security check to allow multiple logins and prevent auto-logout on refresh
            // Allow multiple sessions for the same user

            // Generate JWT
            $payload = [
                'role' => 'user',
                'type' => 'github',
                'github_id' => $user['id'],
                'github_login' => $user['login'],
                'name' => $user['name'],
                'avatar_url' => $user['avatar_url'],
                'exp' => time() + (12 * 60 * 60)
            ];
            $token = JWT::encode($payload, env('JWT_SECRET'), 'HS256');

            // Generate session token
            $sessionToken = substr(str_shuffle(str_repeat('0123456789abcdefghijklmnopqrstuvwxyz', 20)), 0, 20) . dechex(time());

            // Create session
            AuthSession::create([
                'username' => $user['login'],
                'account_type' => 'github',
                'avatar_url' => $user['avatar_url'],
                'access_token' => $accessToken,
                'session_token' => $sessionToken,
                'expires_at' => Carbon::now()->addHours(12)
            ]);

            return response()->json([
                'token' => $token,
                'session_token' => $sessionToken,
                'github_id' => $user['id'],
                'github_login' => $user['login'],
                'name' => $user['name'],
                'avatar_url' => $user['avatar_url'],
                'role' => 'user',
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to authenticate with GitHub'], 500);
        }
    }

    /**
     * Check if user has an active session
     */
    private function hasActiveSession(string $username): bool
    {
        // First cleanup expired sessions for this user
        $this->cleanupExpiredSessionsForUser($username);
        
        return AuthSession::where('username', $username)
            ->where('is_authenticated', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', Carbon::now());
            })
            ->exists();
    }

    /**
     * Cleanup expired sessions for specific user
     */
    private function cleanupExpiredSessionsForUser(string $username): void
    {
        AuthSession::where('username', $username)
            ->where('expires_at', '<', Carbon::now())
            ->where('is_authenticated', true)
            ->update(['is_authenticated' => false]);
    }

    /**
     * Cleanup expired sessions
     */
    private function cleanupExpiredSessions(): void
    {
        AuthSession::where('expires_at', '<', Carbon::now())
            ->where('is_authenticated', true)
            ->update(['is_authenticated' => false]);
    }
}

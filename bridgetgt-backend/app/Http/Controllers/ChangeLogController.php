<?php

namespace App\Http\Controllers;

use App\Models\ChangeLog;
use Illuminate\Http\Request;

class ChangeLogController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $pageSize = $request->input('pageSize', 20);
        $limit = $request->input('limit', $pageSize);
        $entity = $request->input('entity');
        $entityId = $request->input('entity_id');

        $query = ChangeLog::query()
            ->leftJoin('auth_sessions', 'change_logs.session_id', '=', 'auth_sessions.id')
            ->select(
                'change_logs.*',
                'auth_sessions.id as session.id',
                'auth_sessions.username as session.username',
                'auth_sessions.account_type as session.account_type',
                'auth_sessions.avatar_url as session.avatar_url'
            );

        if ($entity) {
            $query->where('change_logs.entity', $entity);
        }

        if ($entityId) {
            $query->where('change_logs.entity_id', $entityId);
        }

        $total = ChangeLog::query()->count();

        $logs = $query->orderBy('change_logs.timestamp', 'desc')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get()
            ->map(function ($log) {
                // Group session data into a nested object
                $sessionData = null;
                if ($log->{'session.id'}) {
                    $sessionData = [
                        'id' => $log->{'session.id'},
                        'username' => $log->{'session.username'},
                        'account_type' => $log->{'session.account_type'},
                        'avatar_url' => $log->{'session.avatar_url'},
                    ];
                }
                
                return [
                    'id' => $log->id,
                    'session_id' => $log->session_id,
                    'action' => $log->action,
                    'entity' => $log->entity,
                    'entity_id' => $log->entity_id,
                    'details' => $log->details,
                    'timestamp' => $log->timestamp,
                    'session' => $sessionData,
                ];
            });

        return response()->json([
            'logs' => $logs,
            'pagination' => [
                'page' => (int)$page,
                'pageSize' => (int)$limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }

    public function show($id)
    {
        $log = ChangeLog::find($id);
        
        if (!$log) {
            return response()->json(['error' => 'Change log not found'], 404);
        }

        return response()->json($log);
    }
}

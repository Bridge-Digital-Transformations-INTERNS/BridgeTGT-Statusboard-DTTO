<?php

namespace App\Http\Controllers;

use App\Models\Developer;
use App\Models\ChangeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Events\DeveloperCreated;
use App\Events\DeveloperUpdated;
use App\Events\DeveloperDeleted;

class DeveloperController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->input('page', 1);
        $pageSize = $request->input('pageSize', 10);

        $query = Developer::with('roles');  // Eager load roles
        $total = $query->count();
        
        $developers = $query->orderBy('id', 'desc')
            ->skip(($page - 1) * $pageSize)
            ->take($pageSize)
            ->get()
            ->map(function ($developer) {
                return [
                    'id' => $developer->id,
                    'name' => $developer->name,
                    'color' => $developer->color,
                    'profile_picture' => $developer->profile_picture,
                    'created_at' => $developer->created_at,
                    'updated_at' => $developer->updated_at,
                    'roles' => $developer->roles->pluck('name')->toArray(),
                ];
            });

        return response()->json([
            'data' => $developers,
            'pagination' => [
                'page' => (int)$page,
                'pageSize' => (int)$pageSize,
                'total' => $total,
                'totalPages' => ceil($total / $pageSize),
            ],
        ]);
    }

    public function show($id)
    {
        $developer = Developer::find($id);
        
        if (!$developer) {
            return response()->json(['error' => 'Developer not found'], 404);
        }

        return response()->json($developer);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'color' => 'required|string',
            'profile_picture' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $developer = Developer::create($request->all());

        // Log the change
        $this->logChange('create', 'developer', $developer->id, null, $developer->toArray(), $request);

        // Broadcast event
        broadcast(new DeveloperCreated($developer))->toOthers();

        return response()->json($developer, 201);
    }

    public function update(Request $request, $id)
    {
        $developer = Developer::find($id);
        
        if (!$developer) {
            return response()->json(['error' => 'Developer not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string',
            'color' => 'sometimes|required|string',
            'profile_picture' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $oldValues = $developer->toArray();
        $developer->update($request->all());

        // Log the change
        $this->logChange('update', 'developer', $developer->id, $oldValues, $developer->toArray(), $request);

        // Broadcast event
        broadcast(new DeveloperUpdated($developer))->toOthers();

        return response()->json($developer);
    }

    public function destroy(Request $request, $id)
    {
        $developer = Developer::find($id);
        
        if (!$developer) {
            return response()->json(['error' => 'Developer not found'], 404);
        }

        $oldValues = $developer->toArray();
        
        // Log the change before deletion
        $this->logChange('delete', 'developer', $developer->id, $oldValues, null, $request);

        $developer->delete();

        // Broadcast event
        broadcast(new DeveloperDeleted($id))->toOthers();

        return response()->json(['success' => true]);
    }

    private function logChange($action, $entityType, $entityId, $oldValues, $newValues, Request $request)
    {
        $sessionToken = $request->header('x-session-token');
        $sessionId = null;

        if ($sessionToken) {
            $session = \App\Models\AuthSession::where('session_token', $sessionToken)
                ->where('is_authenticated', true)
                ->first();
            
            if ($session) {
                $sessionId = $session->id;
            }
        }

        // Prepare details based on action type
        $details = [];
        if ($action === 'create') {
            $details = $newValues;
        } elseif ($action === 'update') {
            $details = $newValues;
        } elseif ($action === 'delete') {
            $details = $oldValues;
        }

        ChangeLog::create([
            'session_id' => $sessionId,
            'action' => $action,
            'entity' => $entityType,
            'entity_id' => $entityId,
            'details' => $details, // Let Laravel's cast handle JSON conversion
            'timestamp' => now(),
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ChangeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Events\ProjectCreated;
use App\Events\ProjectUpdated;
use App\Events\ProjectDeleted;

class ProjectController extends Controller
{
    public function index()
    {
        $projects = Project::all();
        return response()->json($projects);
    }

    public function show($id)
    {
        $project = Project::find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        return response()->json($project);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $project = Project::create($request->all());

        // Log the change
        $this->logChange('create', 'project', $project->id, null, $project->toArray(), $request);

        // Broadcast event
        broadcast(new ProjectCreated($project))->toOthers();

        return response()->json($project, 201);
    }

    public function update(Request $request, $id)
    {
        $project = Project::find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $oldValues = $project->toArray();
        $project->update($request->all());

        // Log the change
        $this->logChange('update', 'project', $project->id, $oldValues, $project->toArray(), $request);

        // Broadcast event
        broadcast(new ProjectUpdated($project))->toOthers();

        return response()->json($project);
    }

    public function destroy(Request $request, $id)
    {
        $project = Project::find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $oldValues = $project->toArray();
        
        // Log the change before deletion
        $this->logChange('delete', 'project', $project->id, $oldValues, null, $request);

        $project->delete();

        // Broadcast event
        broadcast(new ProjectDeleted($id))->toOthers();

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

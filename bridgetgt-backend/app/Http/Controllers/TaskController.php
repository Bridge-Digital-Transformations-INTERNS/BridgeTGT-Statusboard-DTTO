<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\ChangeLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Events\TaskCreated;
use App\Events\TaskUpdated;
use App\Events\TaskDeleted;

class TaskController extends Controller
{
    public function index()
    {
        $tasks = Task::all();
        return response()->json($tasks);
    }

    public function show($id)
    {
        $task = Task::find($id);
        
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        return response()->json($task);
    }

    public function getByProject($projectId, Request $request)
    {
        return $this->getTasksByProject($projectId, $request);
    }

    public function getTasksByProject($projectId, Request $request)
    {
        $page = $request->input('page', 1);
        $limit = $request->input('limit', 20);

        // Eager load assignees to avoid N+1 queries
        $query = Task::with('assignees')->where('project_id', $projectId);
        $total = $query->count();

        $tasks = $query->skip(($page - 1) * $limit)
            ->take($limit)
            ->get()
            ->map(function ($task) {
                $taskArray = $task->toArray();
                $taskArray['assignees'] = $task->assignees->map(function($assignee) {
                    return [
                        'id' => $assignee->id,
                        'name' => $assignee->name,
                        'color' => $assignee->color,
                        'profile_picture' => $assignee->profile_picture,
                    ];
                });
                return $taskArray;
            });

        return response()->json([
            'tasks' => $tasks,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }

    public function getAllWithAssignees()
    {
        return $this->getAllTasksWithAssignees();
    }

    public function getAllTasksWithAssignees(Request $request)
    {
        $limit = $request->input('limit', 1000);  // Default large limit for "all" queries
        
        $tasks = Task::with(['assignees', 'project'])
            ->take($limit)
            ->get()
            ->map(function ($task) {
                $taskArray = $task->toArray();
                $taskArray['project_name'] = $task->project ? $task->project->name : null;
                $taskArray['assignees'] = $task->assignees->map(function($assignee) {
                    return [
                        'id' => $assignee->id,
                        'name' => $assignee->name,
                        'color' => $assignee->color,
                        'profile_picture' => $assignee->profile_picture,
                    ];
                });
                return $taskArray;
            });
        
        return response()->json($tasks);
    }

    public function getWithAssigneesByProject($projectId)
    {
        return $this->getTasksWithAssigneesByProject($projectId);
    }

    public function getTasksWithAssigneesByProject($projectId)
    {
        $tasks = Task::with(['assignees', 'project'])
            ->where('project_id', $projectId)
            ->orderBy('phase')
            ->orderBy('id')
            ->get()
            ->map(function ($task) {
                $taskArray = $task->toArray();
                $taskArray['project_name'] = $task->project ? $task->project->name : null;
                $taskArray['assignees'] = $task->assignees->map(function($assignee) {
                    return [
                        'id' => $assignee->id,
                        'name' => $assignee->name,
                        'color' => $assignee->color,
                        'profile_picture' => $assignee->profile_picture,
                    ];
                });
                return $taskArray;
            });
        
        return response()->json($tasks);
    }

    public function getStructuredGanttData($projectId)
    {
        $tasks = Task::with('assignees')
            ->where('project_id', $projectId)
            ->get();

        $grouped = $tasks->groupBy('phase');
        
        $structured = $grouped->map(function ($phaseTasks, $phaseName) {
            return [
                'phase' => $phaseName,
                'tasks' => $phaseTasks->map(function ($task) {
                    return array_merge($task->toArray(), [
                        'assignees' => $task->assignees
                    ]);
                })->values()
            ];
        })->values();

        return response()->json($structured);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|integer|exists:projects,id',
            'title' => 'required|string',
            'phase' => 'required|string',
            'weight' => 'required|in:light,medium,heavy',
            'status' => 'required|string',
            'startDate' => 'required|date',
            'targetDate' => 'required|date',
            'endDate' => 'nullable|date',
            'color' => 'nullable|string',
            'assigneeIds' => 'nullable|array',
            'assigneeIds.*' => 'integer|exists:developers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $task = Task::create($request->except('assigneeIds'));

        // Attach assignees if provided
        if ($request->has('assigneeIds')) {
            $task->assignees()->attach($request->input('assigneeIds'));
        }

        // Load assignees for response
        $task->load('assignees');

        // Log the change
        $this->logChange('create', 'task', $task->id, null, $task->toArray(), $request);

        // Broadcast event
        broadcast(new TaskCreated($task))->toOthers();

        return response()->json($task, 201);
    }

    public function update(Request $request, $id)
    {
        $task = Task::find($id);
        
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'project_id' => 'sometimes|integer|exists:projects,id',
            'title' => 'sometimes|string',
            'phase' => 'sometimes|string',
            'weight' => 'sometimes|in:light,medium,heavy',
            'status' => 'sometimes|string',
            'startDate' => 'sometimes|date',
            'targetDate' => 'sometimes|date',
            'endDate' => 'nullable|date',
            'color' => 'nullable|string',
            'assigneeIds' => 'nullable|array',
            'assigneeIds.*' => 'integer|exists:developers,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $oldValues = $task->toArray();
        $task->update($request->except('assigneeIds'));

        // Update assignees if provided
        if ($request->has('assigneeIds')) {
            $task->assignees()->sync($request->input('assigneeIds'));
        }

        // Load assignees for response
        $task->load('assignees');

        // Log the change
        $this->logChange('update', 'task', $task->id, $oldValues, $task->toArray(), $request);

        // Broadcast event
        broadcast(new TaskUpdated($task))->toOthers();

        return response()->json($task);
    }

    public function bulkUpdate(Request $request)
    {
        // Accept both 'tasks' and 'updates' for compatibility
        $tasksData = $request->input('tasks') ?? $request->input('updates');
        
        if (!$tasksData || !is_array($tasksData)) {
            return response()->json(['error' => 'Tasks or updates array is required'], 400);
        }

        $updatedTasks = [];

        DB::beginTransaction();
        try {
            foreach ($tasksData as $taskData) {
                if (!isset($taskData['id'])) {
                    continue;
                }

                $task = Task::find($taskData['id']);
                if ($task) {
                    // Only update fields that are present in the request
                    $updateData = array_filter($taskData, function($key) {
                        return $key !== 'id';
                    }, ARRAY_FILTER_USE_KEY);
                    
                    $task->update($updateData);
                    $task->load('assignees');
                    $updatedTasks[] = $task;
                }
            }

            DB::commit();

            // Broadcast bulk update event
            foreach ($updatedTasks as $task) {
                broadcast(new TaskUpdated($task))->toOthers();
            }

            return response()->json([
                'success' => true, 
                'updated' => count($updatedTasks),
                'tasks' => $updatedTasks,
                'results' => $updatedTasks
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateTimeline(Request $request, $id)
    {
        $task = Task::find($id);
        
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'startDate' => 'nullable|date',
            'targetDate' => 'nullable|date',
            'endDate' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 400);
        }

        $task->update($request->only(['startDate', 'targetDate', 'endDate']));
        $task->load('assignees');

        // Broadcast event
        broadcast(new TaskUpdated($task))->toOthers();

        return response()->json($task);
    }

    public function destroy(Request $request, $id)
    {
        $task = Task::find($id);
        
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }

        $oldValues = $task->toArray();
        
        // Log the change before deletion
        $this->logChange('delete', 'task', $task->id, $oldValues, null, $request);

        $task->delete();

        // Broadcast event
        broadcast(new TaskDeleted($id))->toOthers();

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

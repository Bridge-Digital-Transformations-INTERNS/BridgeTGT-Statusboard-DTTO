<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Developer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Events\TaskAssigneeAdded;
use App\Events\TaskAssigneeRemoved;

class TaskAssigneeController extends Controller
{
    public function index()
    {
        $taskAssignees = DB::table('task_assignees')
            ->join('tasks', 'task_assignees.task_id', '=', 'tasks.id')
            ->join('developers', 'task_assignees.developer_id', '=', 'developers.id')
            ->select('task_assignees.*', 'tasks.title as task_title', 'developers.name as developer_name')
            ->get();
        
        return response()->json($taskAssignees);
    }

    public function store(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'developer_id' => 'required|exists:developers,id',
        ]);

        $task = Task::find($request->task_id);
        $developer = Developer::find($request->developer_id);
        
        // Check if already attached
        if ($task->assignees()->where('developer_id', $request->developer_id)->exists()) {
            return response()->json(['error' => 'Developer already assigned to task'], 400);
        }

        $task->assignees()->attach($request->developer_id);

        // Broadcast event with developer info
        broadcast(new TaskAssigneeAdded($request->task_id, $request->developer_id, $developer))->toOthers();

        return response()->json(['success' => true], 201);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'task_id' => 'required|exists:tasks,id',
            'developer_id' => 'required|exists:developers,id',
        ]);

        $task = Task::find($request->task_id);
        $task->assignees()->detach($request->developer_id);

        // Broadcast event
        broadcast(new TaskAssigneeRemoved($request->task_id, $request->developer_id))->toOthers();

        return response()->json(['success' => true]);
    }

    public function getTaskAssignees($taskId, Request $request)
    {
        $limit = $request->input('limit', 100);
        $page = $request->input('page', 1);
        
        $task = Task::find($taskId);
        
        if (!$task) {
            return response()->json(['error' => 'Task not found'], 404);
        }
        
        $total = $task->assignees()->count();
        $assignees = $task->assignees()
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();
        
        return response()->json([
            'assignees' => $assignees,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }
}

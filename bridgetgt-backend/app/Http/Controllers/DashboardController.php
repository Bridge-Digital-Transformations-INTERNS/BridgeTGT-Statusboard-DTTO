<?php

namespace App\Http\Controllers;

use App\Models\Developer;
use App\Models\Task;
use App\Models\Project;
use App\Models\AuthSession;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get initial app data in a single request
     * This reduces the number of HTTP requests on app startup
     */
    public function getInitialData(Request $request)
    {
        $projectId = $request->input('project_id');
        
        // Get developers with their roles (eager loaded)
        $developers = Developer::with('roles')
            ->orderBy('name')
            ->get()
            ->map(function ($developer) {
                return [
                    'id' => $developer->id,
                    'name' => $developer->name,
                    'color' => $developer->color,
                    'profile_picture' => $developer->profile_picture,
                    'roles' => $developer->roles->pluck('name')->toArray(),
                ];
            });

        // Get projects
        $projects = Project::orderBy('name')->get();

        // Get tasks with assignees if project ID is provided
        $tasks = [];
        if ($projectId) {
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
        }

        // Get online users
        $onlineUsers = AuthSession::active()
            ->select('username', 'avatar_url', 'account_type')
            ->get();

        return response()->json([
            'developers' => $developers,
            'projects' => $projects,
            'tasks' => $tasks,
            'onlineUsers' => $onlineUsers,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Developer;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeveloperRoleController extends Controller
{
    public function index()
    {
        $developerRoles = DB::table('developer_roles')
            ->join('developers', 'developer_roles.developer_id', '=', 'developers.id')
            ->join('roles', 'developer_roles.role_id', '=', 'roles.id')
            ->select('developer_roles.*', 'developers.name as developer_name', 'roles.name as role_name')
            ->get();
        
        return response()->json($developerRoles);
    }

    public function store(Request $request)
    {
        $request->validate([
            'developer_id' => 'required|exists:developers,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $developer = Developer::find($request->developer_id);
        
        // Check if already attached
        if ($developer->roles()->where('role_id', $request->role_id)->exists()) {
            return response()->json(['error' => 'Role already assigned to developer'], 400);
        }

        $developer->roles()->attach($request->role_id);

        return response()->json(['success' => true], 201);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'developer_id' => 'required|exists:developers,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        $developer = Developer::find($request->developer_id);
        $developer->roles()->detach($request->role_id);

        return response()->json(['success' => true]);
    }

    public function getDeveloperRoles($developerId, Request $request)
    {
        $limit = $request->input('limit', 100);
        $page = $request->input('page', 1);
        
        $developer = Developer::find($developerId);
        
        if (!$developer) {
            return response()->json(['error' => 'Developer not found'], 404);
        }
        
        $total = $developer->roles()->count();
        $roles = $developer->roles()
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();
        
        return response()->json([
            'roles' => $roles,
            'pagination' => [
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total' => $total,
                'totalPages' => ceil($total / $limit),
            ],
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    // ១. ស្ថិតិប្រព័ន្ធទាំងមូលសម្រាប់ Admin
    public function stats()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = User::where('is_active', false)->count();

        $usersByRole = [
            'admin' => User::where('role', 'admin')->count(),
            'manager' => User::where('role', 'manager')->count(),
            'member' => User::where('role', 'member')->count(),
        ];

        $totalProjects = Project::count();
        $totalTasks = Task::count();
        $completedTasks = Task::where('status', 'Completed')->count();
        $inProgressTasks = Task::where('status', 'In Progress')->count();
        $toDoTasks = Task::where('status', 'To Do')->count();

        return response()->json([
            'success' => true,
            'data' => [
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'inactive' => $inactiveUsers,
                    'by_role' => $usersByRole,
                ],
                'projects' => [
                    'total' => $totalProjects,
                ],
                'tasks' => [
                    'total' => $totalTasks,
                    'completed' => $completedTasks,
                    'in_progress' => $inProgressTasks,
                    'to_do' => $toDoTasks,
                ],
            ],
        ], 200);
    }

    // ២. បញ្ជី User ទាំងអស់ (Search + Filter + Pagination)
    public function users(Request $request)
    {
        $query = User::query()->withCount('projects');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('is_active') && $request->is_active !== '') {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (!is_null($isActive)) {
                $query->where('is_active', $isActive);
            }
        }

        $users = $query->latest()->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $users,
        ], 200);
    }

    // ៣. មើលព័ត៌មានលម្អិតរបស់ User រួមទាំង Projects & Tasks របស់គាត់
    public function showUser(User $user)
    {
        $user->load(['projects.tasks']);

        return response()->json([
            'success' => true,
            'data' => $user,
        ], 200);
    }

    // ៤. កែប្រែ Role របស់ User
    public function updateRole(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string|in:admin,manager,member',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        if ($request->user()->id === $user->id && $request->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'You cannot change your own admin role.',
            ], 403);
        }

        $user->update([
            'role' => $request->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User role updated successfully.',
            'data' => $user,
        ], 200);
    }

    // ៥. Activate / Deactivate គណនី User
    public function updateStatus(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $isActive = $request->boolean('is_active');

        if ($request->user()->id === $user->id && !$isActive) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account.',
            ], 403);
        }

        $user->update([
            'is_active' => $isActive,
        ]);

        if (!$isActive) {
            $user->tokens()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $isActive ? 'User account activated.' : 'User account deactivated.',
            'data' => $user,
        ], 200);
    }
}
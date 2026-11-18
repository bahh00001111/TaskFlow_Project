<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request){
        $userId = $request->user()->id;

        // ទាញយក Project ទាំងអស់របស់ User នេះ
        $projects = Project::where('user_id', $userId)->with('tasks')->get();

        $totalProjects = $projects->count();

        // រាប់ចំនួន Tasks សរុប និងតាម Status នីមួយៗ
        $totalTasks = 0;
        $completedTasks = 0;
        $inProgressTasks = 0;
        $toDoTasks = 0;

        foreach ($projects as $project){
            $totalTasks += $project->tasks->count();
            $completedTasks += $project->tasks->where('status', 'Completed')->count();
            $inProgressTasks += $project->tasks->where('status', 'In Progress')->count();
            $toDoTasks += $project->tasks->where('status', 'To Do')->count();
        }

        return response()->json([
            'success' => true,
            'data' =>[
                'total_projects' =>$totalProjects,
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'in_progress_tasks' => $inProgressTasks,
                'to_do_tasks' => $toDoTasks,
            ]
        ], 200);

    }
}

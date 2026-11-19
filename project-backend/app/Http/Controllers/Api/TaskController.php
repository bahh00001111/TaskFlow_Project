<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    // ១. បង្ហាញបញ្ជី Tasks ទាំងអស់ក្នុង Project ណាមួយ (Index)
   public function index(Request $request, Project $project)
{
    // ១. ពិនិត្យសិទ្ធិម្ចាស់ Project ជាមុនសិន
    if ($project->user_id !== $request->user()->id) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized access to this project.'
        ], 403);
    }

    // ២. ចាប់ផ្តើម Query លើ tasks របស់ project
    $query = $project->tasks();

    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('status', 'like', "%{$search}%");
        });
    }

    // ៣. Return ទិន្នន័យដែលបាន Filter ពី $query
    return response()->json([
        'success' => true,
        'data' => $query->latest()->paginate(10)
    ], 200);
}

    // ២. បង្កើត Task ថ្មីក្នុង Project (Store)
    public function store(Request $request, Project $project)
    {
        // ពិនិត្យសិទ្ធិម្ចាស់ Project
        if ($project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this project.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:To Do,In Progress,Completed',
            'priority' => 'nullable|string|in:Low,Medium,High',
            'due_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // បង្កើត Task ភ្ជាប់ជាមួយ Project ID
        $task = $project->tasks()->create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'To Do',
            'priority' => $request->priority ?? 'Medium',
            'due_date' => $request->due_date,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Task created successfully.',
            'data' => $task
        ], 201);
    }

    // ៣. បង្ហាញព័ត៌មានលម្អិត Task ណាមួយ (Show)
    public function show(Request $request, Project $project, Task $task)
    {
        // ពិនិត្យសិទ្ធិម្ចាស់ Project និងផ្ទៀងផ្ទាត់ថា Task នេះស្ថិតក្នុង Project ហ្នឹងមែន
        if ($project->user_id !== $request->user()->id || $task->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $task
        ], 200);
    }

    // ៤. កែប្រែ Task (Update)
    public function update(Request $request, Project $project, Task $task)
    {
         // ពិនិត្យសិទ្ធិម្ចាស់ Project និងផ្ទៀងផ្ទាត់ថា Task នេះស្ថិតក្នុង Project ហ្នឹងមែន
        if ($project->user_id !== $request->user()->id || $task->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.'
            ], 403);
        }
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:To Do,In Progress,Completed',
            'priority' => 'nullable|string|in:Low,Medium,High',
            'due_date' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $task->update($request->only([
            'title', 
            'description', 
            'status', 
            'priority', 
            'due_date'
        ]));
        return response()->json([
            'success' => true,
            'message' => 'Task updated successfully.',
            'data' => $task
        ], 200);
    }

    // ៥. លុប Task (Destroy)
   public function destroy(Request $request, Project $project, Task $task)
    {
        if ($project->user_id !== $request->user()->id || $task->project_id !== $project->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.'
            ], 403);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Task deleted successfully.'
        ], 200);
    }
}

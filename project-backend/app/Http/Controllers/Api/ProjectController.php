<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProjectController extends Controller
{
    // ១. បង្ហាញបញ្ជី Project ទាំងអស់របស់ User ដែលកំពុង Login (Read - Index)
    public function index(Request $request)
    {
        // ប្រើ paginate(10) ដើម្បីកំណត់ឱ្យបង្ហាញត្រឹម 10 Projects ក្នុងមួយទំព័រ
        $projects = $request->user()->projects()->with('tasks')->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $projects
        ], 200);
    }

    // ២. បង្កើត Project ថ្មី (Create - Store)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:pending,in_progress,completed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'succcess' => false,
                'errror' => $validator->errors()
            ], 422);
        }

        // បង្កើត Project ដោយភ្ជាប់ user_id ជាមួយ User ដែលកំពុង Login
        $project = $request->user()->projects()->create([
            'name' => $request->name,
            'description' => $request->description,
            'status' => $request->status ?? 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Project created successfully.',
            'data' => $project
        ], 201);
    }

    // ៣. បង្ហាញព័ត៌មានលម្អិតរបស់ Project ណាមួយ (Read - Show)
    public function show(Request $request, Project $project)
    {
        // ពិនិត្យមើលថាតើ Project នេះជារបស់ User ហ្នឹងមែន ឬអត់
        if ($project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this project.'
            ], 403);
        }
        // បង្ហាញ tasks ទាំងអស់ដែលស្ថិតក្នុង Project នេះ
        $project->load('tasks');

        return response()->json([
            'success' => true,
            'data' => $project
        ], 200);
    }

    // ៤. កែប្រែ Project (Update)
    public function update(Request $request, Project $project)
    {
        // ពិនិត្យសិទ្ធិម្ចាស់ Project
        if ($project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this project.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:pending,in_progress,completed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $project->update($request->only(['title', 'description', 'status']));

        return response()->json([
            'success' => true,
            'message' => 'Project updated successfully.',
            'data' => $project
        ], 200);
    }

    // ៥. លុប Project (Delete - Destroy)
    public function destroy(Request $request, Project $project)
    {
        // ពិនិត្យសិទ្ធិម្ចាស់ Project
        if ($project->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this project.'
            ], 403);
        }

        $project->delete();
        return response()->json([
            'success' => true,
            'message' => 'Project deleted successfully!!'
        ], 200);
    }
}

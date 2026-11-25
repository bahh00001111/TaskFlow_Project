<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    // ១. ការចុះឈ្មោះ (Register API)
    public function register(Request $request){
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            
        ]);

        if ($validator->fails()){
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), 
            'role' => 'member',
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Register Successfully.',
            'data' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ], 201);
    }

    // ២. ការចូលគណនី (Login API)
    public function login(Request $request){
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string'
        ]);

        if($validator->fails()){
            return response()->json([
                'success' => false,
                'error' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        // 🛑 កែត្រង់នេះ ($user->password មិនមែន passowrd)
        if (!$user || !Hash::check($request->password, $user->password)){
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.'
            ], 401);
        }
        if (!$user->is_active){
            return response()->json([
                'success' => false,
                'message' =>'Your account id deactivated. Please contact an administator.'
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        
        return response()->json([
            'success' => true, // 🛑 កែពី suceess មក success
            'message' => 'Login Successfully.',
            'data' => $user,
            'access_token' => $token, // 🛑 កែពី access-token មក access_token
            'token_type' => 'Bearer',
        ]);
    }

    // ៣. ការចេញពីគណនី (Logout API)
    public function logout(Request $request){
        // លុប Token បច្ចុប្បន្នដែល User កំពុងប្រើប្រាស់
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Logged Out Successfully!!',
        ]);
    }

    // ៤. មើលព័ត៌មាន User បច្ចុប្បន្ន (Get Authenticated User)
    public function me(Request $request){ // 🛑 កែពី $rewuest មក $request
        return response()->json([ // 🛑 កែពី josn មក json
            'success' => true,
            'data' => $request->user() // គួរប្រើ data ជំនួស message
        ]);
    }
}